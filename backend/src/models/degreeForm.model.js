import mongoose from "mongoose";
import { ApiError } from "../utils/ApiError.js";

const degreeFormSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    description: {
        type: String
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    activeFrom: {
        type: Date,
        required: true
    },
    lastDate: {
        type: Date,
        required: true
    },
}, { timestamps: true });

degreeFormSchema.pre("save", async function (next) {
    if (this.isModified('title')) {
        const existingForm = await this.constructor.findOne({
            title: { $regex: new RegExp(`^${this.title}$`, 'i') },
            _id: { $ne: this._id }
        });

        if (existingForm) {
            next(new ApiError("400", "Form with the same title already exists"))
        }
    }

    if (this.activeFrom > this.lastDate) {
        next(new ApiError("400", "Starting date of the form cannot be after the last date."));
    }
    next();
})

export const DegreeForm = mongoose.model("DegreeForm", degreeFormSchema);