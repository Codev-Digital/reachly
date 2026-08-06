const fs = require('fs');

function updateChatPage(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');

  // 1. Add states
  const statesPattern = /const messagesEndRef = useRef<HTMLDivElement \| null>\(null\);/;
  const statesReplacement = `const messagesEndRef = useRef<HTMLDivElement | null>(null);

  // Attachment states
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [uploadError, setUploadError] = useState<boolean>(false);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const uploadAbortController = useRef<AbortController | null>(null);

  const triggerFileInput = () => {
    if (fileInputRef.current) fileInputRef.current.click();
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !activeChat) return;

    setUploadFile(file);
    setIsUploading(true);
    setUploadProgress(0);
    setUploadError(false);

    try {
      const tokenRes = await fetch('/api/messages/upload/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fileName: file.name, fileType: file.type }),
      });

      if (!tokenRes.ok) throw new Error('Failed to get upload token');
      const { signedUrl, publicUrl } = await tokenRes.json();

      const xhr = new XMLHttpRequest();
      const abortController = new AbortController();
      uploadAbortController.current = abortController;

      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          const percent = Math.round((event.loaded / event.total) * 100);
          setUploadProgress(percent);
        }
      };

      await new Promise((resolve, reject) => {
        xhr.open('PUT', signedUrl, true);
        
        xhr.onload = () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            resolve(xhr.responseText);
          } else {
            reject(new Error(\`Upload failed: \${xhr.statusText}\`));
          }
        };

        xhr.onerror = () => reject(new Error('Upload failed'));
        xhr.onabort = () => reject(new Error('Upload canceled'));
        xhr.setRequestHeader('Content-Type', file.type);
        xhr.send(file);
        
        abortController.signal.addEventListener('abort', () => xhr.abort());
      });

      let msgType = 'document';
      if (file.type.startsWith('image/')) msgType = 'image';
      else if (file.type.startsWith('video/')) msgType = 'video';
      else if (file.type === 'application/pdf') msgType = 'pdf';

      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        // Find senderId dynamically
        const isCreatorPage = filePath.includes('creators');
        const sid = isCreatorPage ? creatorId : userId;
        
        wsRef.current.send(JSON.stringify({
          type: 'message',
          conversationId: activeChat,
          senderId: sid,
          senderRole: isCreatorPage ? 'creator' : 'user',
          content: \`[Attached \${msgType}]\`,
          attachment: {
            url: publicUrl,
            fileType: msgType,
            fileName: file.name,
            fileSize: file.size
          }
        }));
      }

      setIsUploading(false);
      setUploadFile(null);
      uploadAbortController.current = null;
      scrollToBottom();
    } catch (err: any) {
      if (err.message === 'Upload canceled') {
        setUploadError(true);
      } else {
        console.error('File upload error:', err);
        setUploadError(true);
      }
    }
    
    // Clear input
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const cancelUpload = () => {
    if (uploadAbortController.current) {
      uploadAbortController.current.abort();
    }
  };

  const retryUpload = () => {
    if (uploadFile) {
      handleFileUpload({ target: { files: [uploadFile] } } as any);
    }
  };
`;

  content = content.replace(statesPattern, statesReplacement.replace(/filePath\.includes\('creators'\)/g, filePath.includes('creators') ? 'true' : 'false')
                                                            .replace(/creatorId : userId/g, filePath.includes('creators') ? 'creatorId' : 'userId'));

  // 2. Render attachment in messages
  const messageRenderPattern = /(<div className={`p-4 shadow-sm relative \${isMe \? 'bg-\[#0012FF\] text-white rounded-l-2xl rounded-tr-2xl' : 'bg-white text-gray-800 rounded-r-2xl rounded-tl-2xl'} `}>)/;
  
  const messageRenderReplacement = \`$1
                                    {msg.attachment ? (
                                      <div className="flex flex-col gap-2">
                                        {msg.attachment.fileType === 'image' && (
                                          <a href={msg.attachment.url} target="_blank" rel="noopener noreferrer">
                                            <img src={msg.attachment.url} alt="Attachment" className="max-w-[240px] max-h-[240px] rounded-lg object-cover cursor-pointer hover:opacity-90 transition-opacity" />
                                          </a>
                                        )}
                                        {msg.attachment.fileType === 'video' && (
                                          <video controls src={msg.attachment.url} className="max-w-[240px] max-h-[240px] rounded-lg" />
                                        )}
                                        {(msg.attachment.fileType === 'document' || msg.attachment.fileType === 'pdf') && (
                                          <a href={msg.attachment.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 p-3 bg-black/10 rounded-xl hover:bg-black/20 transition-colors">
                                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
                                            <div className="flex flex-col min-w-0">
                                              <span className="text-sm font-semibold truncate max-w-[160px]">{msg.attachment.fileName}</span>
                                              <span className="text-xs opacity-70">{(msg.attachment.fileSize / 1024 / 1024).toFixed(2)} MB</span>
                                            </div>
                                          </a>
                                        )}
                                      </div>
                                    ) : \`;

  content = content.replace(messageRenderPattern, messageRenderReplacement);
  
  // Close the ternary for msg.attachment
  const contentRenderPattern = /({isAudio \? \([\s\S]*?<\/div>\)\s*:\s*\(<p className="text-sm leading-relaxed whitespace-pre-wrap font-medium">[\s\S]*?<\/p>\)})\s*(<\/div>)/;
  content = content.replace(contentRenderPattern, '$1}$2');

  // 3. Add input icon and upload UI
  const inputContainerPattern = /(<div className="p-4 sm:p-6 bg-white border-t border-gray-100 shrink-0">)/;
  
  const uploadUI = \`
  {isUploading && (
    <div className="mb-4 flex flex-col items-end w-full">
      <div className="bg-[#0012FF] text-white rounded-l-2xl rounded-tr-2xl p-4 shadow-sm relative flex items-center gap-4 min-w-[200px]">
        <div className="relative w-10 h-10 shrink-0 flex items-center justify-center">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
            <path className="text-white/20" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="3" />
            <path className="text-white transition-all duration-300" strokeDasharray="\${uploadProgress}, 100" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="3" />
          </svg>
          <button onClick={cancelUpload} className="absolute inset-0 flex items-center justify-center hover:bg-white/10 rounded-full transition-colors">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
          </button>
        </div>
        <div className="flex flex-col min-w-0">
          <span className="text-sm font-semibold truncate max-w-[120px]">{uploadFile?.name}</span>
          <span className="text-xs opacity-80">{uploadProgress}% uploaded</span>
        </div>
      </div>
    </div>
  )}
  {uploadError && uploadFile && !isUploading && (
    <div className="mb-4 flex flex-col items-end w-full">
      <div className="bg-red-50 text-red-600 rounded-l-2xl rounded-tr-2xl p-4 shadow-sm relative flex items-center gap-4 min-w-[200px] border border-red-100">
        <div className="flex flex-col min-w-0">
          <span className="text-sm font-semibold truncate max-w-[150px]">{uploadFile.name}</span>
          <span className="text-xs">Upload failed or canceled</span>
        </div>
        <button onClick={retryUpload} className="w-10 h-10 shrink-0 bg-red-100 hover:bg-red-200 rounded-full flex items-center justify-center transition-colors">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 2v6h-6" /><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" /></svg>
        </button>
        <button onClick={() => { setUploadError(false); setUploadFile(null); }} className="w-8 h-8 shrink-0 hover:bg-red-100 rounded-full flex items-center justify-center transition-colors absolute -top-3 -right-3 bg-white border border-red-100">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
        </button>
      </div>
    </div>
  )}
  <input type="file" ref={fileInputRef} hidden accept="image/*,video/*,application/pdf,.doc,.docx,.xls,.xlsx" onChange={handleFileUpload} />
  `;

  content = content.replace(inputContainerPattern, \`$1 \n\${uploadUI}\`);

  // 4. Add attachment icon next to microphone
  const micIconPattern = /(<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3z" \/><path d="M19 10v2a7 7 0 0 1-14 0v-2" \/><line x1="12" y1="19" x2="12" y2="23" \/><line x1="8" y1="23" x2="16" y2="23" \/><\/svg>\s*<\/button>)/;
  
  const attachIcon = \`
  <button
    onClick={triggerFileInput}
    className="absolute right-12 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
    title="Attach File"
  >
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"></path></svg>
  </button>
  \`;

  content = content.replace(micIconPattern, \`$1 \n\${attachIcon}\`);
  
  // also adjust input padding for second icon
  content = content.replace(/pr-12 text-sm/g, 'pr-20 text-sm');

  fs.writeFileSync(filePath, content, 'utf8');
  console.log('Updated ' + filePath);
}

updateChatPage('src/app/creators/chats/page.tsx');
updateChatPage('src/app/user/chats/page.tsx');
