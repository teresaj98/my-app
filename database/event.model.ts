import mongoose, {
  HydratedDocument,
  Model,
  Schema,
  type SaveOptions,
} from "mongoose";

/** Shape stored in MongoDB (timestamps added by Mongoose). */
export interface EventSchemaFields {
  title: string;
  slug: string;
  description: string;
  overview: string;
  image: string;
  venue: string;
  location: string;
  date: string;
  time: string;
  mode: string;
  audience: string;
  agenda: string[];
  organizer: string;
  tags: string[];
  createdAt?: Date;
  updatedAt?: Date;
}

/** URL-safe slug from title (lowercase, hyphenated, ASCII). */
function slugifyTitle(title: string): string {
  return title
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

const ISO_DATE_ONLY = /^\d{4}-\d{2}-\d{2}$/;

/** True when y-m-d is a real calendar day (local date parts, no UTC shift). */
function isValidYmdParts(y: number, m: number, d: number): boolean {
  if (!Number.isInteger(y) || y < 1) return false;
  if (!Number.isInteger(m) || m < 1 || m > 12) return false;
  if (!Number.isInteger(d) || d < 1 || d > 31) return false;
  const constructed = new Date(y, m - 1, d);
  return (
    constructed.getFullYear() === y &&
    constructed.getMonth() === m - 1 &&
    constructed.getDate() === d
  );
}

/**
 * Store as `YYYY-MM-DD`. Date-only strings stay literal (no UTC reinterpretation);
 * other inputs use local calendar fields from `Date`, not `toISOString()`.
 */
function normalizeDateToIso(value: string): string {
  const trimmed = value.trim();

  if (ISO_DATE_ONLY.test(trimmed)) {
    const parts = trimmed.split("-");
    const y = Number(parts[0]);
    const m = Number(parts[1]);
    const d = Number(parts[2]);
    if (!isValidYmdParts(y, m, d)) {
      throw new mongoose.Error.ValidatorError({
        path: "date",
        message: "Invalid date; use a recognizable date string or ISO-8601 format.",
        type: "invalid",
        value: trimmed,
      });
    }
    return trimmed;
  }

  const parsed = new Date(trimmed);
  if (Number.isNaN(parsed.getTime())) {
    throw new mongoose.Error.ValidatorError({
      path: "date",
      message: "Invalid date; use a recognizable date string or ISO-8601 format.",
      type: "invalid",
      value: trimmed,
    });
  }

  const y = parsed.getFullYear();
  const mo = parsed.getMonth() + 1;
  const day = parsed.getDate();
  return `${y}-${String(mo).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

/**
 * Normalize time to 24-hour `HH:mm` (leading zeros) for consistent storage and display.
 * Accepts `14:30`, `2:30 PM`, `2:30PM`, optional seconds (ignored in output).
 */
function normalizeTimeString(value: string): string {
  const raw = value.trim().replace(/\./g, "").replace(/\s+/g, " ");

  const withMeridiem =
    /^(\d{1,2}):(\d{2})(?::(\d{2}))?\s*(AM|PM)$/i.exec(raw) ??
    /^(\d{1,2}):(\d{2})(?::(\d{2}))?(AM|PM)$/i.exec(raw.replace(/\s/g, ""));

  if (withMeridiem) {
    let hour = Number.parseInt(withMeridiem[1], 10);
    const minute = withMeridiem[2];
    const mer = withMeridiem[4].toUpperCase();

    if (hour < 1 || hour > 12 || Number.parseInt(minute, 10) > 59) {
      throw new mongoose.Error.ValidatorError({
        path: "time",
        message: "Invalid 12-hour time.",
        type: "invalid",
        value: raw,
      });
    }
    if (mer === "PM" && hour < 12) hour += 12;
    if (mer === "AM" && hour === 12) hour = 0;
    return `${String(hour).padStart(2, "0")}:${minute}`;
  }

  const twentyFour = /^(\d{1,2}):(\d{2})(?::(\d{2}))?$/.exec(raw);
  if (twentyFour) {
    const hour = Number.parseInt(twentyFour[1], 10);
    const minute = twentyFour[2];
    if (hour > 23 || Number.parseInt(minute, 10) > 59) {
      throw new mongoose.Error.ValidatorError({
        path: "time",
        message: "Invalid 24-hour time.",
        type: "invalid",
        value: raw,
      });
    }
    return `${String(hour).padStart(2, "0")}:${minute}`;
  }

  throw new mongoose.Error.ValidatorError({
    path: "time",
    message: "Time must be like 14:30 or 2:30 PM.",
    type: "invalid",
    value: raw,
  });
}

function assertNonEmptyString(
  doc: HydratedDocument<EventSchemaFields>,
  path: keyof Pick<
    EventSchemaFields,
    | "title"
    | "description"
    | "overview"
    | "image"
    | "venue"
    | "location"
    | "mode"
    | "audience"
    | "organizer"
  >,
): void {
  const v = doc.get(path) as unknown;
  if (typeof v !== "string" || v.trim().length === 0) {
    throw new mongoose.Error.ValidatorError({
      path: String(path),
      message: "Must be a non-empty string.",
      type: "required",
      value: v,
    });
  }
}

function assertNonEmptyStringArray(
  doc: HydratedDocument<EventSchemaFields>,
  path: "agenda" | "tags",
): void {
  const v = doc.get(path) as unknown;
  if (!Array.isArray(v) || v.length === 0) {
    throw new mongoose.Error.ValidatorError({
      path,
      message: "Must be a non-empty array of strings.",
      type: "required",
      value: v,
    });
  }
  for (let i = 0; i < v.length; i++) {
    const item = v[i];
    if (typeof item !== "string" || item.trim().length === 0) {
      throw new mongoose.Error.ValidatorError({
        path: `${path}.${i}`,
        message: "Each entry must be a non-empty string.",
        type: "invalid",
        value: item,
      });
    }
  }
}

const eventSchema = new Schema<EventSchemaFields>(
  {
    title: { type: String, required: [true, "Title is required"], trim: true },
    slug: { type: String, required: true, unique: true, index: true, trim: true },
    description: { type: String, required: [true, "Description is required"], trim: true },
    overview: { type: String, required: [true, "Overview is required"], trim: true },
    image: { type: String, required: [true, "Image is required"], trim: true },
    venue: { type: String, required: [true, "Venue is required"], trim: true },
    location: { type: String, required: [true, "Location is required"], trim: true },
    date: { type: String, required: [true, "Date is required"], trim: true },
    time: { type: String, required: [true, "Time is required"], trim: true },
    mode: { type: String, required: [true, "Mode is required"], trim: true },
    audience: { type: String, required: [true, "Audience is required"], trim: true },
    agenda: {
      type: [String],
      required: [true, "Agenda is required"],
      validate: {
        validator: (v: unknown) => Array.isArray(v) && v.length > 0,
        message: "Agenda must contain at least one item.",
      },
    },
    organizer: { type: String, required: [true, "Organizer is required"], trim: true },
    tags: {
      type: [String],
      required: true,
      validate: {
        validator: (v: unknown) => Array.isArray(v) && v.length > 0,
        message: "Tags must contain at least one item.",
      },
    },
  },
  {
    timestamps: true,
    /**
     * Mongoose runs `validate()` before `pre('save')` by default, which would reject
     * the first save while `slug` is still empty. We validate manually at the end of
     * `pre('save')` after slug generation and normalization.
     */
    validateBeforeSave: false,
  },
);

/**
 * Slug from title (only when title changed or document is new), ISO date + 24h time,
 * and explicit non-empty checks; then run schema `validate()` so built-in rules still apply.
 */
eventSchema.pre(
  "save",
  async function (this: HydratedDocument<EventSchemaFields>, _opts: SaveOptions) {
    void _opts;
    try {
      assertNonEmptyString(this, "title");
      assertNonEmptyString(this, "description");
      assertNonEmptyString(this, "overview");
      assertNonEmptyString(this, "image");
      assertNonEmptyString(this, "venue");
      assertNonEmptyString(this, "location");
      assertNonEmptyString(this, "mode");
      assertNonEmptyString(this, "audience");
      assertNonEmptyString(this, "organizer");
      assertNonEmptyStringArray(this, "agenda");
      assertNonEmptyStringArray(this, "tags");

      this.set("date", normalizeDateToIso(String(this.get("date"))));
      this.set("time", normalizeTimeString(String(this.get("time"))));

      const titleChanged = this.isModified("title");
      if (this.isNew || titleChanged) {
        const Model = this.constructor as Model<EventSchemaFields>;
        const baseSlug = slugifyTitle(String(this.get("title")));
        if (baseSlug.length === 0) {
          throw new mongoose.Error.ValidatorError({
            path: "slug",
            message: "Title must yield a non-empty slug.",
            type: "invalid",
            value: this.get("title"),
          });
        }
        let candidate = baseSlug;
        let suffix = 0;
        // Ensure unique slug across other documents.
        while (
          await Model.exists({
            slug: candidate,
            _id: { $ne: this._id },
          })
        ) {
          suffix += 1;
          candidate = `${baseSlug}-${suffix}`;
        }
        this.set("slug", candidate);
      }

      await this.validate();
    } catch (err: unknown) {
      throw err instanceof Error ? err : new Error(String(err));
    }
  },
);

export type EventModel = Model<EventSchemaFields>;

export const Event: EventModel =
  (mongoose.models.Event as EventModel | undefined) ??
  mongoose.model<EventSchemaFields>("Event", eventSchema);
