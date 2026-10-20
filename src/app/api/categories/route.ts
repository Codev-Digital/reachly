import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import connectDB from '@/lib/mongodb';
import Category from '@/models/Category';

const DEFAULT_CATEGORIES = [
  { name: 'Lifestyle', icon: 'heart', order: 1 },
  { name: 'Tech', icon: 'monitor', order: 2 },
  { name: 'Fitness', icon: 'dumbbell', order: 3 },
  { name: 'Fashion', icon: 'hanger', order: 4 },
  { name: 'Business', icon: 'briefcase', order: 5 },
  { name: 'Education', icon: 'book', order: 6 },
  { name: 'Beauty', icon: 'sparkles', order: 7 },
  { name: 'Food', icon: 'utensils', order: 8 },
  { name: 'Software Engineering', icon: 'monitor', order: 9 },
  { name: 'Digital Marketing', icon: 'briefcase', order: 10 },
];

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    // Check if any categories exist. If none, seed initial default categories
    const count = await Category.countDocuments();
    if (count === 0) {
      await Category.insertMany(
        DEFAULT_CATEGORIES.map((cat) => ({
          ...cat,
          slug: slugify(cat.name),
          isActive: true,
        }))
      );
    }

    const categories = await Category.find({ isActive: true })
      .sort({ order: 1, name: 1 })
      .lean();

    return NextResponse.json({
      success: true,
      categories,
    });
  } catch (error) {
    console.error('Error in GET /api/categories:', error);
    // Return graceful fallback list if DB connection experiences temporary issue
    return NextResponse.json({
      success: true,
      categories: DEFAULT_CATEGORIES.map((c) => ({
        ...c,
        slug: slugify(c.name),
        isActive: true,
      })),
    });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    // If authenticated in production, verify admin email
    const adminEmails = ['abdullahgotaccess@gmail.com', 'admin@reachly.com'];
    if (
      process.env.NODE_ENV === 'production' &&
      session?.user?.email &&
      !adminEmails.includes(session.user.email.toLowerCase())
    ) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const rawName = typeof body.name === 'string' ? body.name.trim() : '';

    if (!rawName) {
      return NextResponse.json(
        { error: 'Category name is required' },
        { status: 400 }
      );
    }

    if (rawName.length < 2) {
      return NextResponse.json(
        { error: 'Category name must be at least 2 characters' },
        { status: 400 }
      );
    }

    await connectDB();

    const slug = slugify(rawName);

    // Case-insensitive duplicate check
    const existing = await Category.findOne({
      $or: [
        { name: { $regex: new RegExp(`^${rawName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i') } },
        { slug },
      ],
    });

    if (existing) {
      return NextResponse.json(
        { error: `Category "${existing.name}" already exists` },
        { status: 409 }
      );
    }

    const currentCount = await Category.countDocuments();
    const newCategory = await Category.create({
      name: rawName,
      slug,
      icon: body.icon || 'tag',
      description: body.description || '',
      isActive: true,
      order: currentCount + 1,
    });

    return NextResponse.json(
      {
        success: true,
        category: newCategory,
        message: 'Category created successfully',
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error in POST /api/categories:', error);
    return NextResponse.json(
      { error: 'Failed to create category' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const adminEmails = ['abdullahgotaccess@gmail.com', 'admin@reachly.com'];
    if (
      process.env.NODE_ENV === 'production' &&
      session?.user?.email &&
      !adminEmails.includes(session.user.email.toLowerCase())
    ) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const name = searchParams.get('name');

    if (!id && !name) {
      return NextResponse.json({ error: 'Category ID or name required' }, { status: 400 });
    }

    await connectDB();

    if (id) {
      await Category.findByIdAndDelete(id);
    } else if (name) {
      await Category.findOneAndDelete({
        name: { $regex: new RegExp(`^${name.trim()}$`, 'i') },
      });
    }

    return NextResponse.json({ success: true, message: 'Category deleted successfully' });
  } catch (error) {
    console.error('Error in DELETE /api/categories:', error);
    return NextResponse.json({ error: 'Failed to delete category' }, { status: 500 });
  }
}
