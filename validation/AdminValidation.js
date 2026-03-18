import Joi from "joi";
import resposne from "../middleware/resposne.js";

const adminRegister = Joi.object({
  first_name: Joi.string().required().messages({
    "string.empty": "First name is not allowed to be empty",
    "any.required": "First name is required",
  }),
  last_name: Joi.string().required().messages({
    "string.empty": "Last name is not allowed to be empty",
    "any.required": "Last name is required",
  }),
  email: Joi.string().email().required().messages({
    "string.empty": "Email is not allowed to be empty.",
    "string.email": "Email must be a valid email address.",
    "any.required": "Email is required.",
  }),
  password: Joi.string().min(8).max(16).required().messages({
    "string.empty": " Password is not allowed to be Empty",
    "string.min": " Password must be at least 8 characters long.",
    "string.max": " Password must not exceed 16 characters.",
    "any.required": "Password is required",
  }),
  company: Joi.string().required().messages({
    "string.empty": "Company is not allowed to be empty",
    "any.required": "Company is required",
  }),
  mobile_number: Joi.string()
    .length(10)
    .pattern(/[6-9]{1}[0-9]{9}/)
    .required()
    .messages({
      "string.empty": " Mobile number is not allowed to be Empty",
      "string.length": "Mobile number must be exactly 10 digits long",
      "string.pattern.base":
        "Mobile number must start with digits 6-9 and contain only digits",
      "any.required": "Mobile number is required",
    }),
  country: Joi.string().required().messages({
    "string.empty": "Country is not allowed to be empty",
    "any.required": "Country is required",
  }),
});

export const validateAdmin = (req, res, next) => {
  const { error } = adminRegister.validate(req.body);

  if (error) {
    return res.status(400).json({
      status: resposne.successFalse,
      message: error.details[0].message,
    });
  }
  next();
};

const adminLogin = Joi.object({
  email: Joi.string().email().required().messages({
    "string.empty": "Email is not allowed to be empty.",
    "string.email": "Email must be a valid email address.",
    "any.required": "Email is required.",
  }),
  password: Joi.string().min(8).max(16).required().messages({
    "string.empty": " Password is not allowed to be Empty",
    "string.min": " Password must be at least 8 characters long.",
    "string.max": " Password must not exceed 16 characters.",
    "any.required": "Password is required",
  }),
});

export const validateAdminLogin = (req, res, next) => {
  const { error } = adminLogin.validate(req.body);
  if (error) {
    return res.status(400).json({
      status: resposne.successFalse,
      message: error.details[0].message,
    });
  }
  next();
};

const OTPsend = Joi.object({
  email: Joi.string().email().required().messages({
    "string.empty": "Email is not allowed to be empty.",
    "string.email": "Email must be a valid email address.",
    "any.required": "Email is required.",
  }),
});

export const validateotp = (req, res, next) => {
  const { error } = OTPsend.validate(req.body);

  if (error) {
    return res.status(400).json({
      status: resposne.successFalse,
      message: error.details[0].message,
    });
  }

  next();
};

const OTPverify = Joi.object({
  email: Joi.string().email().required().messages({
    "string.empty": "Email is not allowed to be empty.",
    "string.email": "Email must be a valid email address.",
    "any.required": "Email is required.",
  }),
  otp: Joi.string()
    .length(6)
    .pattern(/^[0-9]{6}$/)
    .required()
    .messages({
      "string.length": "OTP must be exactly 6 digits long",
      "string.pattern.base":
        "OTP must be exactly 6 digits consisting of numbers only",
      "any.required": "OTP is required",
    }),
});

export const validateVerifyOtp = (req, res, next) => {
  const { error } = OTPverify.validate(req.body);

  if (error) {
    return res.status(400).json({
      status: resposne.successFalse,
      message: error.details[0].message,
    });
  }

  next();
};

const forgetPassword = Joi.object({
  email: Joi.string().email().required().messages({
    "string.empty": "Email is not allowed to be empty.",
    "string.email": "Email must be a valid email address.",
    "any.required": "Email is required.",
  }),
  newPassword: Joi.string().required().min(8).max(16).messages({
    "string.empty": "New Password Cannot be empty",
    "string.min": "New Password be Atleast 8 Characters Long",
    "string.max": "New Password should be less than 16 Characters",
    "any.required": "New Password is Required.",
  }),
  confirmPassword: Joi.string().required().min(8).max(16).messages({
    "string.empty": "Confirm Password Cannot be empty",
    "string.min": "Confirm Password should be atleast 8 Characters Long",
    "string.max": "Confirm PAssword Should be Less than 16 Characters Long.",
    "any.required": "Confirm Password is Required.",
  }),
});

export const validateupdateForgetPassword = (req, res, next) => {
  const { error } = forgetPassword.validate(req.body);

  if (error) {
    return res.status(400).json({
      status: resposne.successFalse,
      message: error.details[0].message,
    });
  }

  next();
};

const eventCreate = Joi.object({
  event_name: Joi.string().required().messages({
    "string.empty": "Event Name is not allowed to be empty",
    "any.required": "Event Name is required",
  }),
  industry_type: Joi.array().items(Joi.string()).required().messages({
    "array.base": "Industry Type must be an array",
    "array.includesType":
      "Each item in the Industry Type array must be a string",
    "any.required": "Industry Type is required",
  }),
  closing_date: Joi.string().required().messages({
    "string.empty": "Closing Date is not allowed to be empty",
    "any.required": "Closing Date is required",
  }),
  closing_time: Joi.string().required().messages({
    "string.empty": "Closing Time is not allowed to be empty",
    "any.required": "Closing Time is required",
  }),
  email: Joi.string().email().required().messages({
    "string.empty": "Email is not allowed to be empty.",
    "string.email": "Email must be a valid email address.",
    "any.required": "Email is required.",
  }),
  event_url: Joi.string().required().messages({
    "string.empty": "Event Url is not allowed to be empty",
    "any.required": "Event Url is required",
  }),
  time_zone: Joi.string().required().messages({
    "string.empty": "Time Zone is not allowed to be empty",
    "any.required": "Time Zone is required",
  }),
  additional_email: Joi.alternatives().try(
    Joi.string()
      .email()
      .messages({
        "string.email": "Additional Email must be a valid email address.",
      })
      .optional(),
    Joi.array()
      .items(
        Joi.string().email().messages({
          "string.email":
            "Each email in the array must be a valid email address.",
        })
      )
      .optional()
  ),
  is_endorsement: Joi.number().valid(0, 1).messages({
    "any.only": "Value must be either 0 or 1",
    "any.required": "Endorsement field is required",
  }),
  is_withdrawal: Joi.number().valid(0, 1).messages({
    "any.only": "Value must be either 0 or 1",
    "any.required": "Withdrawal field is required",
  }),
  is_ediit_entry: Joi.number().valid(0, 1).messages({
    "any.only": "Value must be either 0 or 1",
    "any.required": "Edit Entry field is required",
  }),
  limit_submission: Joi.number().valid(0, 1).messages({
    "any.only": "Value must be either 0 or 1",
    "any.required": "Limit Submission field is required",
  }),
  submission_limit: Joi.number().when("limit_submission", {
    is: 1,
    then: Joi.number().min(1).required().messages({
      "any.required":
        "Submission Limit field is required when limit submission is 1",
      "number.min": "Submission Limit must be at least 1",
    }),
    otherwise: Joi.number().optional(),
  }),
  event_description: Joi.string().optional().messages({
    "string.empty": "Event Description cannot be empty",
  }),
});

export const validateEventCreate = (req, res, next) => {
  const { error } = eventCreate.validate(req.body, { abortEarly: false });
  if (error) {
    const errorMessages = error.details.map((err) => ({
      field: err.path[0],
      message: err.message,
    }));

    return res.status(400).json({
      status: resposne.successFalse,
      message: "Validation failed",
      errors: errorMessages,
    });
  }
  next();
};

const awardCreate = Joi.object({
  eventId: Joi.number().required().messages({
    "string.empty": "Event Id is not allowed to be empty",
  }),
  category_name: Joi.string().required().messages({
    "string.empty": "Category Name is not allowed to be empty",
    "any.required": "Category Name is required",
  }),
  category_prefix: Joi.string().required().messages({
    "string.empty": "Category Prefix is not allowed to be empty",
    "any.required": "Category Prefix is required",
  }),
  belongs_group: Joi.string().optional().messages({
    "string.empty": "Belongs Group is not allowed to be empty",
    "any.required": "Belongs Group is required",
  }),
  limit_submission: Joi.number().integer().optional().messages({
    "number.base": "Limit Submission must be a valid number",
    "any.required": "Limit Submission is required",
  }),
  is_start_date: Joi.number().valid(0, 1).optional().messages({
    "any.only": "is Start Date must be either 0 or 1",
    "any.required": "is Start Date field is required",
  }),
  is_end_date: Joi.number().valid(0, 1).optional().messages({
    "any.only": "is End Date must be either 0 or 1",
    "any.required": "is End Date field is required",
  }),
  is_endorsement: Joi.number().valid(0, 1).required().messages({
    "any.only": "Endorsement value must be either 0 or 1",
    "any.required": "Endorsement value field is required",
  }),
  start_date: Joi.string().optional().messages({
    "string.empty": "Start date cannot be empty",
    "string.Date": "Start date must be a valid date",
  }),
  end_date: Joi.string().optional().messages({
    "string.empty": "End date cannot be empty",
    "string.Date": "End date must be a valid date",
  }),
  payment_price: Joi.number().optional().messages({
    "any.empty": "payment price cannot be empty",
  }),
});

export const validateAwardCreate = (req, res, next) => {
  const { error } = awardCreate.validate(req.body);

  if (error) {
    return res.status(400).json({
      status: resposne.successFalse,
      message: error.details[0].message,
    });
  }

  next();
};

const newPassword = Joi.object({
  currentPassword: Joi.string().min(8).max(16).required().messages({
    "string.empty": " Password is not allowed to be Empty",
    "string.min": " Password must be at least 8 characters long.",
    "string.max": " Password must not exceed 16 characters.",
    "any.required": "Password is required",
  }),
  newPassword: Joi.string().min(8).max(16).required().messages({
    "string.empty": " New password is not allowed to be Empty",
    "string.min": " New Password must be at least 8 characters long.",
    "string.max": " New Password must not exceed 16 characters.",
    "any.required": "New password is required",
  }),
});

export const validateNewPass = (req, res, next) => {
  const { error } = newPassword.validate(req.body);

  if (error) {
    return res.status(400).json({
      status: resposne.successFalse,
      message: error.details[0].message,
    });
  }

  next();
};

const UpdateadminProfile = Joi.object({
  first_name: Joi.string().optional().messages({
    "string.empty": "First name is not allowed to be empty",
  }),
  last_name: Joi.string().optional().messages({
    "string.empty": "Last name is not allowed to be empty",
  }),
  email: Joi.string().email().optional().messages({
    "string.empty": "Email is not allowed to be empty.",
    "string.email": "Email must be a valid email address.",
  }),
  time_zone: Joi.string().optional().messages({
    "string.empty": "Time Zone is not allowed to be empty",
  }),
  mobile_number: Joi.string()
    .length(10)
    .pattern(/[6-9]{1}[0-9]{9}/)
    .optional()
    .messages({
      "string.length": "Mobile number must be exactly 10 digits long",
      "string.pattern.base":
        "Mobile number must start with digits 6-9 and contain only digits",
    }),
  company: Joi.string().optional().messages({
    "string.empty": "Company is not allowed to be empty",
  }),
  job_title: Joi.string().optional().messages({
    "string.empty": "Job Title is not allowed to be empty",
  }),
});

export const validateAdminUpdateProfile = (req, res, next) => {
  const { error } = UpdateadminProfile.validate(req.body);

  if (error) {
    return res.status(400).json({
      status: resposne.successFalse,
      message: error.details[0].message,
    });
  }
  next();
};

const updateAwardCategory = Joi.object({
  awardId: Joi.number().required().messages({
    "string.empty": "award ID is not allowed to be empty",
  }),
  category_name: Joi.string().optional().messages({
    "string.empty": "Category Name is not allowed to be empty",
  }),
  category_prefix: Joi.string().optional().messages({
    "string.empty": "Category Prefix is not allowed to be empty",
  }),
  belongs_group: Joi.string().optional().messages({
    "string.empty": "Belongs Group is not allowed to be empty",
  }),
  limit_submission: Joi.string().optional().messages({
    "string.empty": "Limit Submission is not allowed to be empty",
  }),
  is_endorsement: Joi.number().valid(0, 1).optional().messages({
    "any.only": "isEndorsement must be either 0 or 1",
  }),
  is_start_date: Joi.number().valid(0, 1).optional().messages({
    "any.only": "is Start Date must be either 0 or 1",
  }),
  is_end_date: Joi.number().valid(0, 1).optional().messages({
    "any.only": "is End Date must be either 0 or 1",
  }),

  start_date: Joi.string()
    .optional()
    .when("is_start_date", {
      is: 1,
      then: Joi.required().messages({
        "any.required": "Start date is required when is_start_date is 1.",
        "string.empty": "Start date cannot be empty",
        "string.date": "Start date must be a valid date",
      }),
      otherwise: Joi.optional(),
    }),
  end_date: Joi.string()
    .optional()
    .when("is_end_date", {
      is: 1,
      then: Joi.required().messages({
        "any.required": "End date is required when is_end_date is 1.",
        "string.empty": "End date cannot be empty",
        "string.date": "End date must be a valid date",
      }),
      otherwise: Joi.optional(),
    }),
    payment_price: Joi.number().optional().messages({
    "any.empty": "payment price cannot be empty",
  }),
});

export const validateAwardCategoryUpdate = (req, res, next) => {
  const { error } = updateAwardCategory.validate(req.body);

  if (error) {
    return res.status(400).json({
      status: resposne.successFalse,
      message: error.details[0].message,
    });
  }
  next();
};

const updateEventCreate = Joi.object({
  eventId: Joi.number().required().messages({
    "number.base": "Event ID must be a number",
  }),
  event_name: Joi.string().optional().messages({
    "string.empty": "Event name is not allowed to be empty",
  }),
  closing_date: Joi.string().optional().messages({
    "string.empty": "Closing date is not allowed to be empty",
  }),
  closing_time: Joi.string().optional().messages({
    "string.empty": "Closing time is not allowed to be empty",
  }),
  email: Joi.string().email().optional().messages({
    "string.empty": "Email is not allowed to be empty",
    "string.email": "Email must be a valid email address",
  }),
  event_url: Joi.string().optional().messages({
    "string.empty": "Event URL is not allowed to be empty",
  }),
  time_zone: Joi.string().optional().messages({
    "string.empty": "TimeZone is not allowed to be empty",
  }),
  additional_email: Joi.array()
    .items(
      Joi.string().email().messages({
        "string.email": "Additional Email must be a valid email address.",
      })
    )
    .optional(),
  is_endorsement: Joi.number().valid(0, 1).optional().messages({
    "number.base": "Endorsement value must be a number (0 or 1)",
    "any.only": "Endorsement value must be 0 or 1",
  }),
  is_withdrawal: Joi.number().valid(0, 1).optional().messages({
    "number.base": "Withdrawal value must be a number (0 or 1)",
    "any.only": "Withdrawal value must be 0 or 1",
  }),
  is_ediit_entry: Joi.number().valid(0, 1).optional().messages({
    "number.base": "Edit entry value must be a number (0 or 1)",
    "any.only": "Edit entry value must be 0 or 1",
  }),
  limit_submission: Joi.number().valid(0, 1).optional().messages({
    "number.base": "Limit submission value must be a number (0 or 1)",
    "any.only": "Limit submission value must be 0 or 1",
  }),
  submission_limit: Joi.number().optional().messages({
    "number.base": "Submission limit must be a number",
  }),
  industry_type: Joi.array()
    .items(
      Joi.string().messages({
        "string.empty": "Industry type cannot be empty",
      })
    )
    .optional()
    .messages({
      "array.base": "Industry type must be an array",
    }),
});

export const validateUpdateEventCreate = (req, res, next) => {
  const { error } = updateEventCreate.validate(req.body);

  if (error) {
    return res.status(400).json({
      status: resposne.successFalse,
      message: error.details[0].message,
    });
  }
  next();
};

const eventupdateSocial = Joi.object({
  eventId: Joi.number().required().messages({
    "number.base": "Event ID must be a valid number",
    "any.required": "Event ID is required"
  }),

  event_description: Joi.string().optional().messages({
    "string.base": "Event description must be a valid string",
  }),

  closing_messsage: Joi.string().optional().messages({
    "string.base": "Closing message must be a valid string",
  }),

  jury_welcm_messsage: Joi.string().optional().messages({
    "string.base": "Jury welcome message must be a valid string",
  }),
  is_social: Joi.number().valid(0, 1).optional().messages({
    "number.base": "Is social must be a number (0 or 1)",
    "any.only": "Is social must be either 0 or 1",
  }),
  social: Joi.array()
    .items(Joi.string().valid("facebook", "linkedin", "twitter"))
    .optional()
    .messages({
      "array.base": "Social must be an array of valid strings",
      "string.base": "Each social platform must be a valid string",
      "any.only":
        "Each social platform must be one of the following values: facebook, linkedin, twitter",
    }),
  event_logo: Joi.any().optional().messages({
    "any.base": "Event logo must be a valid file",
  }),

  event_banner: Joi.any().optional().messages({
    "any.base": "Event banner must be a valid file",
  }),

  social_image: Joi.any().optional().messages({
    "any.base": "Social share image must be a valid file",
  }),
});

export const validateUpdateEventSocial = (req, res, next) => {
  const { error } = eventupdateSocial.validate(req.body);

  if (error) {
    return res.status(400).json({
      status: resposne.successFalse,
      message: error.details[0].message,
    });
  }
  next();
};

const CreateSubmissionID = Joi.object({
  eventId: Joi.number().required().messages({
    "number.base": "Event ID must be a valid number.",
    "any.required": "Event ID is required.",
  }),
  caseValue: Joi.number().valid(1, 2, 3).required().messages({
    "number.base": "Case Value must be a valid number.",
    "any.required": "Case Value is required.",
    "any.only": "Case Value must be one of the following values: 1, 2, or 3.",
  }),
  digits: Joi.number().integer().min(1).required().messages({
    "number.base": "Digits must be a valid number.",
    "number.integer": "Digits must be an integer.",
    "number.min": "Digits must be at least 1.",
    "any.required": "Digits are required.",
  }),
  start_from: Joi.number().integer().min(1).required().messages({
    "number.base": "Start From must be a valid number.",
    "number.integer": "Start From must be an integer.",
    "number.min": "Start From must be at least 1.",
    "any.required": "Start From is required.",
  }),
  increment: Joi.number().integer().min(1).required().messages({
    "number.base": "Increment must be a valid number.",
    "number.integer": "Increment must be an integer.",
    "number.min": "Increment must be at least 1.",
    "any.required": "Increment is required.",
  }),
  prefix: Joi.string().optional().messages({
    "string.base": "Prefix must be a string.",
    "any.required": "Prefix is required.",
  }),
});

export const ValidateSubmissionIDformat = (req, res, next) => {
  const { error } = CreateSubmissionID.validate(req.body);
  if (error) {
    return res.status(400).json({
      status: resposne.successFalse,
      message: error.details[0].message,
    });
  }
  next();
};


const awardDirectory = Joi.object({
  eventId: Joi.number().required().messages({
    "number.base": "Event ID must be a number",
    "any.required": "Event ID is required",
  }),
  is_publicly_visble: Joi.number().valid(0, 1).messages({
    "any.only": "Value must be either 0 or 1",
  }),
});

export const ValidateAwardDirectory = (req, res, next) => {
  const { error } = awardDirectory.validate(req.body);
  if (error) {
    return res.status(400).json({
      status: resposne.successFalse,
      message: error.details[0].message,
    });
  }
  next();
};

const general_settings = Joi.object({
  eventId: Joi.number().required().messages({
    "number.base": "Event ID must be a number",
    "number.integer": "Event ID must be an integer",
  }),
  start_date: Joi.string().isoDate().required().messages({
    "string.base": "Start date must be a valid date string",
    "string.isoDate": "Start date must be in ISO format",
    "any.required": "Start date is required",
  }),
  start_time: Joi.string().required().messages({
    "string.empty": "Start Time is not allowed to be empty",
    "any.required": "Start Time is required",
  }),
  end_date: Joi.string().isoDate().required().messages({
    "string.base": "End date must be a valid date string",
    "string.isoDate": "End date must be in ISO format",
    "any.required": "End date is required",

  }),
  end_time: Joi.string().required().messages({
    "string.empty": "End Time is not allowed to be empty",
    "any.required": "End Time is required",
  }),
  is_active: Joi.number().valid(0, 1).optional().messages({
    "any.only": "is_active must be either 0 or 1",
  }),
  is_one_at_a_time: Joi.number().valid(0, 1).optional().messages({
    "any.only": "is_one_at_a_time must be either 0 or 1",
  }),
  is_individual_category_assigned: Joi.number()
    .valid(0, 1)
    .optional()
    .messages({
      "any.only": "is_individual_category_assigned must be either 0 or 1",
    }),
  is_Completed_Submission: Joi.number().valid(0, 1).optional().messages({
    "any.only": "is_Completed_Submission must be either 0 or 1",
  }),
  is_jury_print_send_all: Joi.number().valid(0, 1).optional().messages({
    "any.only": "is_jury_print_send_all must be either 0 or 1",
  }),
  is_scoring_dropdown: Joi.number().valid(0, 1).optional().messages({
    "any.only": "is_scoring_dropdown must be either 0 or 1",
  }),
  is_comments_box_judging: Joi.number().valid(0, 1).optional().messages({
    "any.only": "is_comments_box_judging must be either 0 or 1",
  }),
  is_data_single_page: Joi.number().valid(0, 1).optional().messages({
    "any.only": "is_data_single_page must be either 0 or 1",
  }),
  is_total: Joi.number().valid(0, 1).optional().messages({
    "any.only": "is_total must be either 0 or 1",
  }),
  is_jury_others_score: Joi.number().valid(0, 1).optional().messages({
    "any.only": "is_jury_others_score must be either 0 or 1",
  }),
  is_abstain: Joi.number().valid(0, 1).optional().messages({
    "any.only": "is_abstain must be either 0 or 1",
  }),
  overall_score: Joi.string().optional().messages({
    "string.base": "Overall Score must be a string",
  }),
  round_name: Joi.string().optional().messages({
    "string.base": "Round Name must be a string",
  }),
});

export const ValidategeneralSettings = (req, res, next) => {
  const { error } = general_settings.validate(req.body);
  if (error) {
    return res.status(400).json({
      status: resposne.successFalse,
      message: error.details[0].message,
    });
  }
  next();
};

const liveEvent = Joi.object({
  eventId: Joi.number().required().messages({
    "number.base": "ID must be a number",
    "any.required": "ID is required",
  }),

});

export const ValidateEventLive = (req, res, next) => {
  const { error } = liveEvent.validate(req.body);
  if (error) {
    return res.status(400).json({
      status: resposne.successFalse,
      message: error.details[0].message,
    });
  }
  next();
};

const ArchiveEvent = Joi.object({
  eventId: Joi.number().required().messages({
    "number.base": "ID must be a number",
    "any.required": "ID is required",
  }),
  is_live: Joi.number().valid(0, 1).optional().messages({
    "any.only": "Value must be either 0 or 1",
  }),
  is_draft: Joi.number().valid(0, 1).optional().messages({
    "any.only": "Value must be either 0 or 1",
  }),
  is_archive: Joi.number().valid(0, 1).optional().messages({
    "any.only": "Value must be either 0 or 1",
  }),
});

export const ValidateEventStatus = (req, res, next) => {
  const { error } = ArchiveEvent.validate(req.body);
  if (error) {
    return res.status(400).json({
      status: resposne.successFalse,
      message: error.details[0].message,
    });
  }
  next();
};

const scorecardCritera = Joi.object({
  eventId: Joi.number().required().messages({
    "number.base": "Event ID must be a number",
    "any.required": "Event ID is required",
  }),
  criteria: Joi.array()
    .items(
      Joi.object({
        title: Joi.string().required().messages({
          "string.empty": "Criteria Title is not allowed to be empty",
          "any.required": "Criteria Title is required",
        }),
        description: Joi.string().required().messages({
          "string.empty": "Description is not allowed to be empty",
          "any.required": "Description is required",
        }),
      })
    )
    .required()
    .messages({
      "array.base": "Criteria must be an array",
      "any.required": "Criteria is required",
    }),
  overall_scorecard: Joi.array()
    .items(
      Joi.string().messages({
        "number.base": "Overall ScoreCard Value must be a number",
        "string.empty": "Overall ScoreCard Value is not allowed to be empty",
      })
    )
    .required()
    .messages({
      "array.base": "Overall ScoreCard Value must be an array",
      "any.required": "Overall ScoreCard Value is required",
    }),
});

export const ValidateScoreCardCriteria = (req, res, next) => {
  const { error } = scorecardCritera.validate(req.body);
  if (error) {
    return res.status(400).json({
      status: resposne.successFalse,
      message: error.details[0].message,
    });
  }
  next();
};

const CriteriaSettingsCreate = Joi.object({
  criteriaId: Joi.number().required().messages({
    "number.base": "Criteria ID must be a number",
    "any.required": "Criteria ID is required",
  }),
  eventId: Joi.number().required().messages({
    "number.base": "Event ID must be a number",
    "any.required": "Event ID is required",
  }),
  criteria_type: Joi.string().optional().messages({
    "string.base": "Criteria Type must be a string.",
  }),
  Values: Joi.array()
    .items(
      Joi.object({
        settingId: Joi.number().integer().required().messages({
          "number.base": "Setting ID must be a number",
          "number.integer": "Setting ID must be an integer",
          "any.required": "Setting ID is required",
        }),
        caption: Joi.string().optional().messages({
          "string.empty": "Caption is not allowed to be empty",
        }),
        value: Joi.string().optional().messages({
          "string.empty": "Value is not allowed to be empty",
        }),
      })
    )
    .optional()
    .messages({
      "array.base": "Values must be an array",
      "any.required": "Values is required",
    }),
});

export const ValidateCriteriaSettingsCreate = (req, res, next) => {
  const { error } = CriteriaSettingsCreate.validate(req.body);
  if (error) {
    return res.status(400).json({
      status: resposne.successFalse,
      message: error.details[0].message,
    });
  }
  next();
};

const juryGroupSchema = Joi.object({
  eventId: Joi.number().required().messages({
    "number.base": "Event ID must be a number.",
    "any.required": "Event ID is required.",
  }),

  group_name: Joi.string().max(255).required().messages({
    "string.base": "Group name must be a string.",
    "string.max": "Group name must be less than or equal to 255 characters.",
    "any.required": "Group name is required.",
  }),

  filtering_pattern: Joi.string().optional().messages({
    "string.base": "Filtering pattern must be a string.",
  }),

  filtering_criterias: Joi.array()
    .items(
      Joi.object({
        category: Joi.string().max(255).required().messages({
          "string.base": "Category must be a string.",
          "string.max":
            "Category must be less than or equal to 255 characters.",
          "any.required": "Category is required.",
        }),
        isValue: Joi.string().optional().messages({
          "string.base": "Value must be a string.",
        }),
      })
    )
    .required()
    .messages({
      "array.base": "Filtering criteria must be an array.",
      "any.required": "Filtering criteria is required.",
    }),

  category: Joi.array().items(Joi.string().max(255)).required().messages({
    "array.base": "Categories must be an array.",
    "string.base": "Each category must be a string.",
    "string.max": "Category must be less than or equal to 255 characters.",
    "any.required": "Categories are required.",
  }),
});

export const ValidateJuryGroupCreate = (req, res, next) => {
  const { error } = juryGroupSchema.validate(req.body);
  if (error) {
    return res.status(400).json({
      status: resposne.successFalse,
      message: error.details[0].message,
    });
  }
  next();
};

const assignJurySchema = Joi.object({
  eventId: Joi.number().required().messages({
    "number.base": "Event ID must be a number.",
    "any.required": "Event ID is required.",
  }),
  roundId: Joi.number().required().messages({
    "number.base": "Round ID must be a number",
    "any.required": "Round ID is required",
    "number.empty": "Round ID is not allowed to be empty",
  }),
  group_name: Joi.array()
    .items(Joi.string())
    .required()
    .messages({
      "any.required": "Group name is required",
      "array.base": "Group name must be an array",
    }),
  email: Joi.string().email().required().messages({
    "string.base": "Email must be a string.",
    "string.empty": "Email is required.",
    "string.email": "Email must be a valid email address.",
    "any.required": "Email is required.",
  }),
  first_name: Joi.string().required().messages({
    "string.base": "First name must be a string.",
    "string.empty": "First name is required.",
    "any.required": "First name is required.",
  }),
  last_name: Joi.string().required().messages({
    "string.base": "Last name must be a string.",
    "string.empty": "Last name is required.",
    "any.required": "Last name is required.",
  }),
  is_readonly: Joi.number().valid(0, 1).required().messages({
    "number.base": "Readonly status must be a number (0 or 1).",
    "any.only": "Readonly status must be 0 or 1.",
    "any.required": "Readonly status is required.",
  }),
  is_auto_signin: Joi.number().valid(0, 1).required().messages({
    "number.base": "Auto signin status must be a number (0 or 1).",
    "any.only": "Auto signin status must be 0 or 1.",
    "any.required": "Auto signin status is required.",
  }),
  is_assign_New: Joi.number().valid(0, 1).optional().messages({
    "number.base": "Assign new status must be a number (0 or 1).",
    "any.only": "Assign new  status must be 0 or 1.",
  }),
  is_assign_close: Joi.number().valid(0, 1).optional().messages({
    "number.base": "Assign close  status must be a number (0 or 1).",
    "any.only": "Assign close status must be 0 or 1.",
  }),
  is_assign_send: Joi.number().valid(0, 1).optional().messages({
    "number.base": "Assign Send Mail status must be a number (0 or 1).",
    "any.only": "Assign Send Mail status must be 0 or 1.",
  }),
  is_locked: Joi.number().valid(0, 1).optional().messages({
    "number.base": "Assign Locked status must be a number (0 or 1).",
    "any.only": "Assign Locked status must be 0 or 1.",
  }),
  round_name: Joi.string().optional().messages({
    "string.base": "Round name must be a string.",
  }),
});

export const ValidateAssignJuryCreate = (req, res, next) => {
  const { error } = assignJurySchema.validate(req.body);
  if (error) {
    return res.status(400).json({
      status: resposne.successFalse,
      message: error.details[0].message,
    });
  }
  next();
};

const scorecardCriteriaUpdate = Joi.object({
  eventId: Joi.number().required().messages({
    "number.base": "Event ID must be a number",
    "number.integer": "Event ID must be an integer",
  }),
  criteria: Joi.array()
    .items(
      Joi.object({
        id: Joi.number().integer().optional().messages({
          "number.base": "Criteria ID must be a number",
          "number.integer": "Criteria ID must be an integer",
          "any.required": "Criteria ID is required",
        }),
        title: Joi.string().optional().messages({
          "string.empty": "Criteria Title is not allowed to be empty",
          "any.required": "Criteria Title is required",
        }),
        description: Joi.string().optional().messages({
          "string.empty": "Description is not allowed to be empty",
          "any.required": "Description is required",
        }),
      })
    )
    .optional()
    .messages({
      "array.base": "Criteria must be an array",
      "any.required": "Criteria is required",
    }),
  overall_scorecard: Joi.array()
    .items(
      Joi.number().optional().messages({
        "number.base": "Overall ScoreCard Value must be a number",
        "number.empty": "Overall ScoreCard Value cannot be empty",
        "any.required": "Overall ScoreCard Value is required",
      })
    )
    .optional()
    .messages({
      "array.base": "Overall ScoreCard Value must be an array",
      "any.required": "Overall ScoreCard Value is required",
    }),
}).custom((value, helpers) => {
  if (value.criteria.length !== value.overall_scorecard.length) {
    return helpers.message(
      "Criteria and Overall Scorecard values must have the same length."
    );
  }
  return value;
});

export const ValidateScoreCardUpdate = (req, res, next) => {
  const { error } = scorecardCriteriaUpdate.validate(req.body);
  if (error) {
    return res.status(400).json({
      status: resposne.successFalse,
      message: error.details[0].message,
    });
  }
  next();
};

const criteriaSettingUpdate = Joi.object({
  criteriaId: Joi.number().required().messages({
    "string.base": `"criteriaId" should be a type of id`,
    "string.empty": `"criteriaId" cannot be an empty field`,
    "any.required": `"criteriaId" is a required field`,
  }),
  eventId: Joi.number().required().messages({
    "string.base": `"eventId" should be a type of Id`,
    "string.empty": `"eventId" cannot be an empty field`,
    "any.required": `"eventId" is a required field`,
  }),
  criteria_type: Joi.string().valid("type1", "type2").required().messages({
    "string.base": `"criteria_type" should be a type of 'text'`,
    "string.empty": `"criteria_type" cannot be an empty field`,
    "any.required": `"criteria_type" is a required field`,
    "any.only": `"criteria_type" must be one of [type1, type2]`,
  }),
  Values: Joi.array()
    .items(
      Joi.object({
        settingId: Joi.string().required().messages({
          "string.base": `"settingId" should be a type of 'text'`,
          "string.empty": `"settingId" cannot be an empty field`,
          "any.required": `"settingId" is a required field`,
        }),
        caption: Joi.string().required().messages({
          "string.base": `"caption" should be a type of 'text'`,
          "string.empty": `"caption" cannot be an empty field`,
          "any.required": `"caption" is a required field`,
        }),
        value: Joi.any().required().messages({
          "any.required": `"value" is a required field`,
        }),
      })
    )
    .required()
    .messages({
      "array.base": `"Values" should be an array`,
      "array.empty": `"Values" cannot be an empty field`,
      "any.required": `"Values" is a required field`,
    }),
});

export const ValidateCriteriaSettingUpdate = (req, res, next) => {
  const { error } = criteriaSettingUpdate.validate(req.body);
  if (error) {
    return res.status(400).json({
      status: resposne.successFalse,
      message: error.details[0].message,
    });
  }
  next();
};

const juryGroupUpdate = Joi.object({
  eventId: Joi.number().required().messages({
    "number.base": "Event ID must be a number.",
    "number.integer": "Event ID must be an integer.",
    "any.required": "Event ID is required.",
  }),

  groupId: Joi.number().integer().required().messages({
    "number.base": "Group ID must be a number.",
    "number.integer": "Group ID must be an integer.",
    "any.required": "Group ID is required.",
  }),

  group_name: Joi.string().max(255).optional().messages({
    "string.base": "Group name must be a string.",
    "string.max": "Group name must be less than or equal to 255 characters.",
  }),

  filtering_pattern: Joi.string().optional().messages({
    "string.base": "Filtering pattern must be a string.",
  }),

  filtering_criterias: Joi.array()
    .items(
      Joi.object({
        id: Joi.number().integer().optional().messages({
          "number.base": "Criteria ID must be a number.",
          "number.integer": "Criteria ID must be an integer.",
        }),

        category: Joi.string().max(255).optional().messages({
          "string.base": "Category must be a string.",
          "string.max":
            "Category must be less than or equal to 255 characters.",
        }),

        isValue: Joi.string().optional().messages({
          "string.base": "Value must be a string.",
        }),
      })
    )
    .optional()
    .messages({
      "array.base": "Filtering criteria must be an array.",
      "any.required": "Filtering criteria is required.",
    }),

  category: Joi.array().items(Joi.string().max(255)).optional().messages({
    "array.base": "Categories must be an array.",
    "string.base": "Each category must be a string.",
    "string.max": "Category must be less than or equal to 255 characters.",
    "any.required": "Categories are required.",
  }),
});

export const ValidateJuryGroupUpdate = (req, res, next) => {
  const { error } = juryGroupUpdate.validate(req.body);
  if (error) {
    return res.status(400).json({
      status: resposne.successFalse,
      message: error.details[0].message,
    });
  }
  next();
};

const couponCreate = Joi.object({
  eventId: Joi.number().required().messages({
    "number.base": "Event ID must be a number.",
    "number.integer": "Event ID must be an integer.",
    "any.required": "Event ID is required.",
  }),
  // category: Joi.number().optional().messages({
  //   "any.string": "Category status must be String.",
  // }),
  coupon_name: Joi.string().required().messages({
    "string.base": "Coupon name must be a string.",
    "any.required": "Coupon name is required.",
  }),
  coupon_code: Joi.optional().required().messages({
    "string.base": "Coupon Code must be a string.",
    "any.required": "Coupon Code is required.",
  }),
  percent_off: Joi.optional().required().messages({
    "string.base": "Percent Off must be a string.",
    "any.required": "Percent Off is required.",
  }),
  coupon_amount: Joi.optional().required().messages({
    "string.base": "Percent Off must be a string.",
    "any.required": "Percent Off is required.",
  }),
  start_date: Joi.string().required().messages({
    "string.empty": "Start date cannot be empty",
    "string.Date": "Start date must be a valid date",
    "any.required": "Start date is required.",
  }),
  end_date: Joi.string().required().messages({
    "string.empty": "End date cannot be empty",
    "string.Date": "End date must be a valid date",
    "any.required": "End date is required.",
  }),
});
export const ValidateCouponCreate = (req, res, next) => {
  const { error } = couponCreate.validate(req.body);
  if (error) {
    return res.status(400).json({
      status: resposne.successFalse,
      message: error.details[0].message,
    });
  }
  next();
};

const filterCategory = Joi.object({
  eventId: Joi.number().required().messages({
    "any.required": "Event Id is required",
    "any.empty": "Event Id is not allowed to be empty",
  }),
  sortOrder: Joi.valid("oldest", "newest").optional().messages({
    "string.empty": "Sort Order is not allowed to be empty",
    "any.empty": "Sort Order is not allowed to be empty",
  }),
  search: Joi.string().optional().messages({
    "string.empty": "search is not allowed to be empty",
    "any.empty": "search is not allowed to be empty",
  }),
});

export const validatefilterCategory = (req, res, next) => {
  const { error } = filterCategory.validate(req.query);

  if (error) {
    return res.status(400).json({
      status: resposne.successFalse,
      message: error.details[0].message,
    });
  }

  next();
};

const RegistartionForm = Joi.object({
  eventId: Joi.number().required().messages({
    "number.base": "Event ID must be a number",
    "any.required": "Event ID is required",
    "number.empty": "Event ID is not allowed to be empty",
  }),
  form_schema: Joi.array().items(Joi.object()).required().messages({
    "any.required": "Form schema is required",
    "array.base": "Form schema must be an array",
  }),
});

export const validateRegistartionForm = (req, res, next) => {
  const { error } = RegistartionForm.validate(req.body);

  if (error) {
    return res.status(400).json({
      status: resposne.successFalse,
      message: error.details[0].message,
    });
  }
  next();
};

const RegistartionFormGet = Joi.object({
  eventId: Joi.number().required().messages({
    "number.base": "Event ID must be a number",
    "any.required": "Event ID is required",
    "number.empty": "Event ID is not allowed to be empty",
  }),
  registrationFormId: Joi.number().required().messages({
    "number.base": "Registration Form ID must be a number",
    "any.required": "Registration Form ID is required",
    "number.empty": "Registration Form ID is not allowed to be empty",
  }),
});

export const validateRegistartionFormGet = (req, res, next) => {
  const { error } = RegistartionFormGet.validate(req.query);

  if (error) {
    return res.status(400).json({
      status: resposne.successFalse,
      message: error.details[0].message,
    });
  }
  next();
};

const RegistartionFormUpdate = Joi.object({
  eventId: Joi.number().required().messages({
    "number.base": "Event ID must be a number",
    "any.required": "Event ID is required",
    "number.empty": "Event ID is not allowed to be empty",
  }),
  registrationFormId: Joi.number().required().messages({
    "number.base": "Registration Form ID must be a number",
    "any.required": "Registration Form ID is required",
    "number.empty": "Registration Form ID is not allowed to be empty",
  }),
  form_schema: Joi.array().items(Joi.object()).required().messages({
    "any.required": "Form schema is required",
    "array.base": "Form schema must be an array",
  }),
});

export const validateRegistartionFormUpdate = (req, res, next) => {
  const { error } = RegistartionFormUpdate.validate(req.body);
  if (error) {
    return res.status(400).json({
      status: resposne.successFalse,
      message: error.details[0].message,
    });
  }
  next();
};

const EntryForm = Joi.object({
  eventId: Joi.number().required().messages({
    "number.base": "Event ID must be a number",
    "any.required": "Event ID is required",
    "number.empty": "Event ID is not allowed to be empty",
  }),
  form_schema: Joi.array().items(Joi.object()).required().messages({
    "any.required": "Form schema is required",
    "array.base": "Form schema must be an array",
  }),
});

export const validateEntryForm = (req, res, next) => {
  const { error } = EntryForm.validate(req.body);

  if (error) {
    return res.status(400).json({
      status: resposne.successFalse,
      message: error.details[0].message,
    });
  }
  next();
};

const EntryFormGet = Joi.object({
  eventId: Joi.number().required().messages({
    "number.base": "Event ID must be a number",
    "any.required": "Event ID is required",
    "number.empty": "Event ID is not allowed to be empty",
  }),
  entryFormId: Joi.number().required().messages({
    "number.base": "Entry Form ID must be a number",
    "any.required": "Entry Form ID is required",
    "number.empty": "Entry Form ID is not allowed to be empty",
  }),

});

export const validateEntryFormGet = (req, res, next) => {
  const { error } = EntryFormGet.validate(req.query);

  if (error) {
    return res.status(400).json({
      status: resposne.successFalse,
      message: error.details[0].message,
    });
  }
  next();
};

const EntryFormUpdate = Joi.object({
  eventId: Joi.number().required().messages({
    "number.base": "Event ID must be a number",
    "any.required": "Event ID is required",
    "number.empty": "Event ID is not allowed to be empty",
  }),
  entryFormId: Joi.number().required().messages({
    "number.base": "Entry Form ID must be a number",
    "any.required": "Entry Form ID is required",
    "number.empty": "Entry Form ID is not allowed to be empty",
  }),
  form_schema: Joi.array().items(Joi.object()).required().messages({
    "any.required": "Form schema is required",
    "array.base": "Form schema must be an array",
  }),
});

export const validateEntryFormUpdate = (req, res, next) => {
  const { error } = EntryFormUpdate.validate(req.body);
  if (error) {
    return res.status(400).json({
      status: resposne.successFalse,
      message: error.details[0].message,
    });
  }
  next();
};

const genSettingGet = Joi.object({
  eventId: Joi.number().required().messages({
    "any.required": "Event Id is required",
    "any.empty": "Event Id is not allowed to be empty",
  }),
});

export const validategenSettingGet = (req, res, next) => {
  const { error } = genSettingGet.validate(req.query);

  if (error) {
    return res.status(400).json({
      status: resposne.successFalse,
      message: error.details[0].message,
    });
  }

  next();
};


const genSettingUpdate = Joi.object({
  eventId: Joi.number().required().messages({
    "number.base": "Event ID must be a number",
    "any.required": "Event ID is required",
    "number.empty": "Event ID is not allowed to be empty",
  }),
  roundId: Joi.number().required().messages({
    "number.base": "Round ID must be a number",
    "any.required": "Round ID is required",
    "number.empty": "Round ID is not allowed to be empty",
  }),
  start_date: Joi.string().isoDate().optional().messages({
    "string.base": "Start date must be a valid date string",
    "string.isoDate": "Start date must be in ISO format",
  }),
  start_time: Joi.string().optional().messages({
    "string.empty": "Start Time is not allowed to be empty",
  }),
  end_date: Joi.string().isoDate().optional().messages({
    "string.base": "End date must be a valid date string",
    "string.isoDate": "End date must be in ISO format",

  }),
  end_time: Joi.string().optional().messages({
    "string.empty": "End Time is not allowed to be empty",
  }),
  is_active: Joi.number().valid(0, 1).optional().messages({
    "any.only": "is_active must be either 0 or 1",
  }),
  is_one_at_a_time: Joi.number().valid(0, 1).optional().messages({
    "any.only": "is_one_at_a_time must be either 0 or 1",
  }),
  is_individual_category_assigned: Joi.number()
    .valid(0, 1)
    .optional()
    .messages({
      "any.only": "is_individual_category_assigned must be either 0 or 1",
    }),
  is_Completed_Submission: Joi.number().valid(0, 1).optional().messages({
    "any.only": "is_Completed_Submission must be either 0 or 1",
  }),
  is_jury_print_send_all: Joi.number().valid(0, 1).optional().messages({
    "any.only": "is_jury_print_send_all must be either 0 or 1",
  }),
  is_scoring_dropdown: Joi.number().valid(0, 1).optional().messages({
    "any.only": "is_scoring_dropdown must be either 0 or 1",
  }),
  is_comments_box_judging: Joi.number().valid(0, 1).optional().messages({
    "any.only": "is_comments_box_judging must be either 0 or 1",
  }),
  is_data_single_page: Joi.number().valid(0, 1).optional().messages({
    "any.only": "is_data_single_page must be either 0 or 1",
  }),
  is_total: Joi.number().valid(0, 1).optional().messages({
    "any.only": "is_total must be either 0 or 1",
  }),
  is_jury_others_score: Joi.number().valid(0, 1).optional().messages({
    "any.only": "is_jury_others_score must be either 0 or 1",
  }),
  is_abstain: Joi.number().valid(0, 1).optional().messages({
    "any.only": "is_abstain must be either 0 or 1",
  }),
  overall_score: Joi.string().optional().messages({
    "string.base": "Overall Score must be a string",
  }),
});

export const validategenSettingUpdate = (req, res, next) => {
  const { error } = genSettingUpdate.validate(req.body);
  if (error) {
    return res.status(400).json({
      status: resposne.successFalse,
      message: error.details[0].message,
    });
  }
  next();
};

const ScorecardFormUpdate = Joi.object({
  scoreFormId: Joi.number().required().messages({
    "number.base": "Scorecard Form ID must be a number",
    "any.required": "Scorecard Form ID is required",
    "number.empty": "Scorecard Form ID is not allowed to be empty",
  }),
  eventId: Joi.number().required().messages({
    "number.base": "Event ID must be a number",
    "any.required": "Event ID is required",
    "number.empty": "Event ID is not allowed to be empty",
  }),
  roundId: Joi.number().required().messages({
    "number.base": "Round ID must be a number",
    "any.required": "Round ID is required",
    "number.empty": "Round ID is not allowed to be empty",
  }),
  form_schema: Joi.array().items(Joi.object()).optional().messages({
    "any.required": "Form schema is required",
    "array.base": "Form schema must be an array",
  }),
  overall_value: Joi.string().optional().messages({
    "string.base": "Overall Scorecard Value must be a string",
  }),
  scorecard_categories: Joi.array().items(Joi.string()).optional().messages({
    "array.base": "Scorecard categories must be an array",
    "array.includesType": "Each item in the scorecard categories array must be a string",
    "any.required": "Scorecard categories are required",
  }),
  categoryId: Joi.string().optional().messages({
    "number.base": "categoryId ID must be a number",
    "any.required": "categoryId ID is required",
    "number.empty": "categoryId ID is not allowed to be empty",
  }),
  
});

export const validateScorecardFormUpdate = (req, res, next) => {
  const { error } = ScorecardFormUpdate.validate(req.body);
  if (error) {
    return res.status(400).json({
      status: resposne.successFalse,
      message: error.details[0].message,
    });
  }
  next();
};

const ScoreForm = Joi.object({
  eventId: Joi.number().required().messages({
    "number.base": "Event ID must be a number",
    "any.required": "Event ID is required",
    "number.empty": "Event ID is not allowed to be empty",
  }),
  roundId: Joi.number().required().messages({
    "number.base": "Round ID must be a number",
    "any.required": "Round ID is required",
    "number.empty": "Round ID is not allowed to be empty",
  }),
  scoreFormId: Joi.number().optional().messages({
    "number.base": "Score Form ID must be a number",
    "any.required": "Score Form ID is required",
    "number.empty": "Score Form ID is not allowed to be empty",
  }),
  form_schema: Joi.array().items(Joi.object()).required().messages({
    "any.required": "Form schema is required",
    "array.base": "Form schema must be an array",
  }),
  overall_value: Joi.string().optional().messages({
    "string.base": "Overall Scorecard Value must be a string",
  }),
  scorecard_categories: Joi.array().items(Joi.string()).required().messages({
    "array.base": "Scorecard categories must be an array",
    "array.includesType": "Each item in the scorecard categories array must be a string",
    "any.required": "Scorecard categories are required",
  }),
 categoryId: Joi.array()
  .items(Joi.number().required())
  .min(1)
  .required()
  .messages({
    "array.base": "categoryId must be an array of numbers",
    "array.includesRequiredUnknowns": "Each categoryId must be a number",
    "array.min": "At least one categoryId is required",
    "any.required": "categoryId is required",
  }),

});

export const validateScoreForm = (req, res, next) => {
  const { error } = ScoreForm.validate(req.body);

  if (error) {
    return res.status(400).json({
      status: resposne.successFalse,
      message: error.details[0].message,
    });
  }
  next();
};


const AssignjuryGet = Joi.object({
  juryAssignId: Joi.number().required().messages({
    "number.base": "Jury Assign ID must be a number.",
    "string.empty": "Jury Assign ID is required.",
    "any.required": "Jury Assign ID is required.",
  }),
  eventId: Joi.number().required().messages({
    "number.base": "Event ID must be a number",
    "any.required": "Event ID is required",
    "number.empty": "Event ID is not allowed to be empty",
  }),
  roundId: Joi.number().required().messages({
    "number.base": "Round ID must be a number",
    "any.required": "Round ID is required",
    "number.empty": "Round ID is not allowed to be empty",
  }),

});

export const validateAssignjuryGet = (req, res, next) => {
  const { error } = AssignjuryGet.validate(req.query);

  if (error) {
    return res.status(400).json({
      status: resposne.successFalse,
      message: error.details[0].message,
    });
  }
  next();
};

const assignJuryupdate = Joi.object({

  juryAssignId: Joi.number().required().messages({
    "number.base": "Jury Assign ID must be a number.",
    "string.empty": "Jury Assign ID is required.",
    "any.required": "Jury Assign ID is required.",
  }),
  eventId: Joi.number().required().messages({
    "number.base": "Event ID must be a number.",
    "string.empty": "Event ID is required.",
    "any.required": "Event ID is required.",
  }),
  roundId: Joi.number().required().messages({
    "number.base": "Round ID must be a number",
    "any.required": "Round ID is required",
    "number.empty": "Round ID is not allowed to be empty",
  }),
  group_name: Joi.array()
    .items(
      Joi.string().max(255).required().messages({
        "string.base": "Each group name must be a string.",
        "string.empty": "Each group name cannot be empty.",
        "string.max": "Each group name must not exceed 255 characters.",
      })
    ).min(1).optional().messages({
      "array.base": "Group name must be an array.",
      "array.min": "At least one group name is required.",
      "any.required": "Group name is required.",
    }),

  email: Joi.string().email().optional().messages({
    "string.base": "Email must be a string.",
    "string.empty": "Email is required.",
    "string.email": "Email must be a valid email address.",
    "any.required": "Email is required.",
  }),
  first_name: Joi.string().optional().messages({
    "string.base": "First name must be a string.",
    "string.empty": "First name is required.",
    "any.required": "First name is required.",
  }),
  last_name: Joi.string().optional().messages({
    "string.base": "Last name must be a string.",
    "string.empty": "Last name is required.",
    "any.required": "Last name is required.",
  }),
  is_readonly: Joi.number().valid(0, 1).optional().messages({
    "number.base": "Readonly status must be a number (0 or 1).",
    "any.only": "Readonly status must be 0 or 1.",
    "any.required": "Readonly status is required.",
  }),
  is_auto_signin: Joi.number().valid(0, 1).optional().messages({
    "number.base": "Auto signin status must be a number (0 or 1).",
    "any.only": "Auto signin status must be 0 or 1.",
    "any.required": "Auto signin status is required.",
  }),
  is_assign_New: Joi.number().valid(0, 1).optional().messages({
    "number.base": "Assign new status must be a number (0 or 1).",
    "any.only": "Assign new  status must be 0 or 1.",
  }),
  is_assign_close: Joi.number().valid(0, 1).optional().messages({
    "number.base": "Assign close  status must be a number (0 or 1).",
    "any.only": "Assign close status must be 0 or 1.",
  }),
  is_assign_send: Joi.number().valid(0, 1).optional().messages({
    "number.base": "Assign Send Mail status must be a number (0 or 1).",
    "any.only": "Assign Send Mail status must be 0 or 1.",
  }),
  is_locked: Joi.number().valid(0, 1).optional().messages({
    "number.base": "Assign Locked status must be a number (0 or 1).",
    "any.only": "Assign Locked status must be 0 or 1.",
  }),
});

export const validateassignJuryupdate = (req, res, next) => {
  const { error } = assignJuryupdate.validate(req.body);
  if (error) {
    return res.status(400).json({
      status: resposne.successFalse,
      message: error.details[0].message,
    });
  }
  next();
};

const bulkmailSchema = Joi.object({
  eventId: Joi.number().required().messages({
    "number.base": "Event ID must be a number.",
    "string.empty": "Event ID is required.",
    "any.required": "Event ID is required.",
  }),
  roundId: Joi.number().required().messages({
    "number.base": "Round ID must be a number",
    "any.required": "Round ID is required",
    "number.empty": "Round ID is not allowed to be empty",
  }),
  round_name: Joi.string().optional().messages({
    "string.base": "Round name must be a string.",
  }),
  data: Joi.array().items(
    Joi.object({
      email: Joi.string().email().required().messages({
        'string.base': '"email" should be a type of text',
        'string.email': '"email" must be a valid email address',
        'any.required': '"email" is required',
      }),
      first_name: Joi.string().required().messages({
        'string.base': '"first_name" should be a type of text',
        'any.required': '"first_name" is required',
      }),
      last_name: Joi.string().required().messages({
        'string.base': '"last_name" should be a type of text',
        'any.required': '"last_name" is required',
      }),
    })
  )
    .min(1)
    .required()
    .messages({
      'array.base': 'data should be an array of data objects',
      'array.min': 'data should contain at least one data object',
      'any.required': 'data is required',
    }),
});



export const validatebulkmailSchema = (req, res, next) => {
  const { error } = bulkmailSchema.validate(req.body);
  if (error) {
    return res.status(400).json({
      status: resposne.successFalse,
      message: error.details[0].message,
    });
  }
  next();
};

const assignJuryDownloadSchema = Joi.object({

  eventId: Joi.number().required().messages({
    "number.base": "Event ID must be a number. (in query)",
    "string.empty": "Event ID is required. (in query)",
    "any.required": "Event ID is required.(in query)",
  }),
  roundId: Joi.number().required().messages({
    "number.base": "Round ID must be a number (in query)",
    "any.required": "Round ID is required (in query)",
    "number.empty": "Round ID is not allowed to be empty (in query)",
  }),

});



export const validatejuryDataDownload = (req, res, next) => {
  const { error } = assignJuryDownloadSchema.validate(req.query);
  if (error) {
    return res.status(400).json({
      status: resposne.successFalse,
      message: error.details[0].message,
    });
  }
  next();
};



const RegistartionSubmission = Joi.object({
  eventId: Joi.number().required().messages({
    "number.base": "Event ID must be a number.",
    "string.empty": "Event ID is required.",
    "any.required": "Event ID is required.",
  }),
  registrationFormId: Joi.number().required().messages({
    "number.base": "Registration Form ID must be a number",
    "any.required": "Registration Form ID is required",
    "number.empty": "Registration Form ID is not allowed to be empty",
  }),
  fields: Joi.object().pattern(
    Joi.string(),
    Joi.string()
  ).required().messages({
    "object.base": "Fields must be an object",
    "object.pattern.base": "Each key and value in the Fields object must be a string",
    "any.required": "Fields is required",
  }),
});



export const validateRegistartionSubmission = (req, res, next) => {
  const { error } = RegistartionSubmission.validate(req.body);
  if (error) {
    return res.status(400).json({
      status: resposne.successFalse,
      message: error.details[0].message,
    });
  }
  next();
};

const EntrySubmission = Joi.object({
  eventId: Joi.number().required().messages({
    "number.base": "Event ID must be a number.",
    "string.empty": "Event ID is required.",
    "any.required": "Event ID is required.",
  }),
  awardcatId: Joi.number().required().messages({
    "number.base": "Award Cat ID must be a number",
    "any.required": "Award Cat ID is required",
    "number.empty": "Award Cat ID is not allowed to be empty",
  }),
  entryFormId: Joi.number().required().messages({
    "number.base": "Entry Form ID must be a number",
    "any.required": "Entry Form ID is required",
    "number.empty": "Entry Form ID is not allowed to be empty",
  }),
  fields: Joi.object().pattern(
    Joi.string(),
    Joi.string()
  ).required().messages({
    "object.base": "Fields must be an object",
    "object.pattern.base": "Each key and value in the Fields object must be a string",
    "any.required": "Fields is required",
  }),
    isDraft: Joi.boolean().optional(), // 🔥 NEW FIELD

});



export const validateEntrySubmission = (req, res, next) => {
  const { error } = EntrySubmission.validate(req.body);
  if (error) {
    return res.status(400).json({
      status: resposne.successFalse,
      message: error.details[0].message,
    });
  }
  next();
};



const shortlist = Joi.object({
  eventId: Joi.number().required().messages({
    "number.base": "Event ID must be a number.",
    "string.empty": "Event ID is required.",
    "any.required": "Event ID is required.",
  }),
  roundId: Joi.number().required().messages({
    "number.base": "Round ID must be a number",
    "any.required": "Round ID is required ",
    "number.empty": "Round ID is not allowed to be empty.",
  }),
  submission_ids: Joi.array().items(Joi.string()).required().messages({
    "array.base": "Submission Ids must be an array",
    "array.includesType":
      "Each item in the Submission Ids array must be a string",
    "any.required": "Submission Ids is required",
  }),
  shortlist_round: Joi.string().optional().messages({
    "string.base": "shortlist_round must be a string.",
    "string.empty": "shortlist_round is not allowed to be empty ",
  }),
});



export const validateShortlist = (req, res, next) => {
  const { error } = shortlist.validate(req.body);
  if (error) {
    return res.status(400).json({
      status: resposne.successFalse,
      message: error.details[0].message,
    });
  }
  next();
};

const customAllocation = Joi.object({
  eventId: Joi.number().required().messages({
    "number.base": "Event ID must be a number.",
    "string.empty": "Event ID is required.",
    "any.required": "Event ID is required.",
  }),
  roundId: Joi.number().required().messages({
    "number.base": "Round ID must be a number",
    "any.required": "Round ID is required ",
    "number.empty": "Round ID is not allowed to be empty.",
  }),
  juryAssignId: Joi.number().required().messages({
    "number.base": "Jury Assign ID must be a number.",
    "string.empty": "Jury Assign ID is required.",
    "any.required": "Jury Assign ID is required.",
  }),
  email: Joi.string().email().required().messages({
    "string.empty": "Email is not allowed to be empty.",
    "string.email": "Email must be a valid email address.",
    "any.required": "Email is required.",
  }),
  submission_ids: Joi.array().items(Joi.string()).required().messages({
    "array.base": "Submission Ids must be an array",
    "array.includesType":
      "Each item in the Submission Ids array must be a string",
    "any.required": "Submission Ids is required",
  }),
  allocation: Joi.string().valid('abstain', 'non-abstain').optional().messages({
    'string.base': 'Allocation should be a type of string',
    'string.empty': 'Allocation cannot be an empty field',
    'any.only': 'Allocation must be either "abstain" or "non-abstain"'
  })
})

export const validateCustomAllocation = (req, res, next) => {
  const { error } = customAllocation.validate(req.body);
  if (error) {
    return res.status(400).json({
      status: resposne.successFalse,
      message: error.details[0].message,
    });
  }
  next();
};


const updateRegistrationData = Joi.object({
  eventId: Joi.number().required().messages({
    "number.base": "Event ID must be a number.",
    "string.empty": "Event ID is required.",
    "any.required": "Event ID is required.",
  }),
  registrationFormId: Joi.number().required().messages({
    "number.base": "Registration Form ID must be a number",
    "any.required": "Registration Form ID is required",
    "number.empty": "Registration Form ID is not allowed to be empty",
  }),
  created_by: Joi.number().optional().messages({
    'string.base': 'Created By must be a string.',
    'any.required': 'Created By is required.',
  }),
  role: Joi.string().valid('admin', 'user').optional().messages({
    'string.base': 'Role must be a string.',
    'any.required': 'Role is required.',
    'any.only': 'Role must be either "admin" or "user".',
  }),
  updates: Joi.array().items(Joi.object({
    registrationDataId: Joi.number().required().messages({
      'number.base': 'Registration Data ID must be a number.',
      'any.required': 'Registration Data ID is required in Updates Array.',
    }),

    field_name: Joi.string().required().messages({
      'string.base': 'Field Name must be a string.',
      'any.required': 'Field Name is required in Updates Array.',
    }),

    field_value: Joi.string().required().messages({
      'string.base': 'Field Value must be a string.',
      'any.required': 'Field Value is required in Updates Array.',
    }),
  })
  ).min(1).optional().messages({
    'array.base': 'Updates must be an array.',
    'array.min': 'At least one update is required.',
  }),
});
export const validateRegistrationData = (req, res, next) => {
  const { error } = updateRegistrationData.validate(req.body);
  if (error) {
    return res.status(400).json({
      status: resposne.successFalse,
      message: error.details[0].message,
    });
  }
  next();
};
const updateEntryData = Joi.object({
  eventId: Joi.number().required().messages({
    "number.base": "Event ID must be a number.",
    "string.empty": "Event ID is required.",
    "any.required": "Event ID is required.",
  }),
  entryFormId: Joi.number().required().messages({
    "number.base": "Entry Form ID must be a number",
    "any.required": "Entry Form ID is required",
    "number.empty": "Entry Form ID is not allowed to be empty",
  }),
  submission_id: Joi.string().optional().messages({
    'string.base': 'submission_id must be a string.',
    'any.required': 'submission_id is required.',
  }),
  updates: Joi.array().items(Joi.object({
    entryDataId: Joi.number().required().messages({
      'number.base': 'Entry Data ID must be a number.',
      'any.required': 'Entry Data ID is required in Updates Array.',
    }),

    field_name: Joi.string().required().messages({
      'string.base': 'Field Name must be a string.',
      'any.required': 'Field Name is required in Updates Array.',
    }),

    field_value: Joi.string().required().messages({
      'string.base': 'Field Value must be a string.',
      'any.required': 'Field Value is required in Updates Array.',
    }),
  })
  ).min(1).required().messages({
    'array.base': 'Updates must be an array.',
    'any.required': 'Updates are Required array.',
    'array.min': 'At least one update is required.',
  }),
});

export const validateUpdateEntryData = (req, res, next) => {
  const { error } = updateEntryData.validate(req.body);
  if (error) {
    return res.status(400).json({
      status: resposne.successFalse,
      message: error.details[0].message,
    });
  }
  next();
}

const shortlistValidator = Joi.object({
  eventId: Joi.number().required().messages({
    "number.base": "Event ID must be a number.",
    "string.empty": "Event ID is required.",
    "any.required": "Event ID is required.",
  }),
  roundId: Joi.number().when('is_shortlist', {
    is: 1,
    then: Joi.required().messages({
      'any.required': 'roundId is required when is_shortlist is 1',
    }),
    otherwise: Joi.optional(),
  }),
  is_shortlist: Joi.number().valid(0, 1).optional().messages({
    'string.base': 'is_shortlist must be a string',
    'any.required': 'is_shortlist is required',
    'any.only': 'is_shortlist must be either 0 or 1',
  }),
  limit: Joi.number().integer().min(1).default(100).optional(),
  skip: Joi.number().integer().min(0).default(0).optional(),
});

export const validateGetShortlist = (req, res, next) => {
  const { error } = shortlistValidator.validate(req.query);
  if (error) {
    return res.status(400).json({
      status: resposne.successFalse,
      message: error.details[0].message,
    });
  }
  next();
};