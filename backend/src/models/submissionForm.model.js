import mongoose from "mongoose";
import { BRANCH_LIST } from "../constants.js";

const personalDetailsSchema = new mongoose.Schema({
    fullName: {
        type: String,
        required: true
    },
    dob: {
        type: Date,
        required: true
    },
    gender: {
        type: String,
        enum: ["male", "female"],
        required: true
    },
    email: {
        type: String,
        required: true
    },
    mobileNo: {
        type: String,
        required: true
    },
    guardianName: {
        type: String,
        required: true
    },
    guardianMobileNo: {
        type: String,
        required: true
    },
    guardianEmail: {
        type: String,
        required: true
    },
    address: {
        type: String,
        required: true
    },
    city: {
        type: String,
        required: true
    },
    state: {
        type: String,
        required: true
    },
    pincode: {
        type: String,
        required: true
    }
}, { _id: false });

const educationalDetailsSchema = new mongoose.Schema({
    sscSchoolName: {
        type: String,
        required: true
    },
    sscBoard: {
        type: String,
        required: true
    },
    sscPassingYear: {
        type: Date,
        required: true
    },
    sscPercentile: {
        type: Number,
        required: true
    },
    hscStream: {
        type: String,
        required: true
    },
    hscSchoolName: {
        type: String,
        required: true
    },
    hscBoard: {
        type: String,
        required: true
    },
    hscPassingYear: {
        type: Date,
        required: true
    },
    hscTotalPercentile: {
        type: Number,
        required: true
    },
    hscSciencePercentile: {
        type: Number,
        required: true
    },
    gujcetRollNo: {
        type: String,
        required: true
    },
    gujcetPassingYear: {
        type: Date,
        required: true
    },
    gujcetMarks: {
        type: Number,
        required: true
    },
    gujcetPercentile: {
        type: Number,
        required: true
    }
}, { _id: false });

const documentSchema = new mongoose.Schema({
    candidatePhoto: {
        type: String,
        required: true
    },
    aadharCard: {
        type: String,
        required: true
    },
    sscMarksheet: {
        type: String,
        required: true
    },
    hscMarksheet: {
        type: String,
        required: true
    },
    gujcetMarksheet: {
        type: String,
        required: true
    },
    leavingCertificate: {
        type: String,
    }
}, { _id: false });

const branchPreferenceSchema = new mongoose.Schema({
    pref1: {
        type: String,
        enums: BRANCH_LIST,
        required: true,
        trim: true
    },
    pref2: {
        type: String,
        enums: BRANCH_LIST,
        trim: true
    },
    pref3: {
        type: String,
        enums: BRANCH_LIST,
        trim: true
    },
    pref4: {
        type: String,
        enums: BRANCH_LIST,
        trim: true
    },
    pref5: {
        type: String,
        enums: BRANCH_LIST,
        trim: true
    },
    pref6: {
        type: String,
        enums: BRANCH_LIST,
        trim: true
    },
    pref7: {
        type: String,
        enums: BRANCH_LIST,
        trim: true
    }
}, { _id: false });

const submissionFormSchema = new mongoose.Schema({
    degreeFormId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "DegreeForm",
        required: true,
        index: true
    },
    degreeFormTitle:{
        type: String,
        required: true
    },
    degreeFormDescription: {
        type: String
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
        index: true
    },
    personalDetails: {
        type: personalDetailsSchema,
        required: true
    },
    educationalDetails: {
        type: educationalDetailsSchema,
        required: true
    },
    documents: {
        type: documentSchema,
        required: true
    },
    branchPreferences: {
        type: branchPreferenceSchema,
        required: true
    },
    submittedAt: {
        type: Date,
        default: Date.now()
    }
}, { timestamps: true });

submissionFormSchema.pre("validate", function (next) {
    const preferences = [];
    if (this.pref1) preferences.push(this.pref1);
    if (this.pref2) preferences.push(this.pref2);
    if (this.pref3) preferences.push(this.pref3);
    if (this.pref4) preferences.push(this.pref4);
    if (this.pref5) preferences.push(this.pref5);
    if (this.pref6) preferences.push(this.pref6);
    if (this.pref7) preferences.push(this.pref7);

    const uniquePreferences = new Set(preferences);
    if (preferences.length !== uniquePreferences.size) {
        this.invalidate('preferences', 'Branch preferences must be unique.', 'unique');
        return next();
    }

    if (this.pref2 && !this.pref1) {
        this.invalidate('pref1', 'Preference 1 must be selected if Preference 2 is selected.', 'required');
    }
    if (this.pref3 && !this.pref2) {
        this.invalidate('pref2', 'Preference 2 must be selected if Preference 3 is selected.', 'required');
    }
    if (this.pref4 && !this.pref3) {
        this.invalidate('pref3', 'Preference 3 must be selected if Preference 4 is selected.', 'required');
    }
    if (this.pref5 && !this.pref4) {
        this.invalidate('pref4', 'Preference 4 must be selected if Preference 5 is selected.', 'required');
    }
    if (this.pref6 && !this.pref5) {
        this.invalidate('pref5', 'Preference 5 must be selected if Preference 6 is selected.', 'required');
    }
    if (this.pref7 && !this.pref6) {
        this.invalidate('pref6', 'Preference 6 must be selected if Preference 7 is selected.', 'required');
    }

    next();
})

export const SubmissionForm = mongoose.model("SubmissionForm", submissionFormSchema);