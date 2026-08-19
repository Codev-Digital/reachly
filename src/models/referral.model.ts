import mongoose from "mongoose";
// Create referral interface
interface IReferral {
  referrer: mongoose.Types.ObjectId;
  joinnee: mongoose.Types.ObjectId;
  referalType: "newly_joinned" | "buy_session";
  totalBuyActivities: number;
  buyActivities: IBuyActivity[];
}
// Buy Activity interface
interface IBuyActivity {
  type: "newly_joinned" | "buy_session";
  activityTime: Date;
  totalAmount: number;
  status: string
}
//Buy Activities model
const buyActivitiesSchema = new mongoose.Schema<IBuyActivity>({
  type: {
    type: String,
    enum: ["newly_joinned", "buy_session"],
    required: true,
  },
  activityTime: {
    type: Date,
    default: Date.now,
  },
  totalAmount: {
    type: Number,
    default: 0,
    min: 0,
  },
  status:{
    type: String,
    default: "pending",
  }
});
// Create referral schema

const referralSchema = new mongoose.Schema<IReferral>(
  {
    referrer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    joinnee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    totalBuyActivities: {
      type: Number,
      default: 0,
    },

    buyActivities: {
      type: [buyActivitiesSchema],
      default: [],
    },
  },
  { timestamps: true },
);

//now create model

const Referral =
  mongoose.models.Referral ||
  mongoose.model<IReferral>("Referral", referralSchema);

export default Referral;
