import mongoose, {
  HydratedDocument,
  Model,
  Schema,
  type SaveOptions,
} from "mongoose";
import { Event } from "./event.model";

/** Stored booking row (timestamps from Mongoose). */
export interface BookingSchemaFields {
  eventId: mongoose.Types.ObjectId;
  email: string;
  slug: string;
  createdAt?: Date;
  updatedAt?: Date;
}

/** Practical email shape check; MongoDB layer complements this in pre-save. */
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const bookingSchema = new Schema<BookingSchemaFields>(
  {
    eventId: {
      type: Schema.Types.ObjectId,
      ref: "Event",
      required: true,
      index: true,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      trim: true,
      lowercase: true,
      match: [EMAIL_PATTERN, "Invalid email format"],
    },
    slug: {
      type: String,
      required: true,
      trim: true,
    },
  },
  {
    timestamps: true,
  },
);

/**
 * Ensure the referenced event exists before persisting (foreign-key style integrity).
 * Runs in `pre('save')` so it applies to inserts and email-only updates on the same row.
 */
bookingSchema.pre(
  "save",
  async function (this: HydratedDocument<BookingSchemaFields>, _opts: SaveOptions) {
    void _opts;
    const email = String(this.get("email") ?? "").trim().toLowerCase();
    if (!EMAIL_PATTERN.test(email)) {
      throw new mongoose.Error.ValidatorError({
        path: "email",
        message: "Email must be a valid address.",
        type: "invalid",
        value: email,
      });
    }
    this.set("email", email);

    const eventId = this.get("eventId") as mongoose.Types.ObjectId | undefined;
    if (!eventId) {
      throw new mongoose.Error.ValidatorError({
        path: "eventId",
        message: "eventId is required.",
        type: "required",
        value: eventId,
      });
    }

    const slug = this.get("slug") as string | undefined;
    if (!slug) {
      throw new mongoose.Error.ValidatorError({
        path: "slug",
        message: "slug is required.",
        type: "required",
        value: slug,
      });
    }
    const exists = await Event.exists({ _id: eventId });
    if (!exists) {
      throw new Error(`No Event found for eventId=${eventId.toString()}`);
    }
  },
);

export type BookingModel = Model<BookingSchemaFields>;

export const Booking: BookingModel =
  (mongoose.models.Booking as BookingModel | undefined) ??
  mongoose.model<BookingSchemaFields>("Booking", bookingSchema);
