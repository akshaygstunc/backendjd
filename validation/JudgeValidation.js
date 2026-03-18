import Joi from "joi";
import resposne from "../middleware/resposne.js";
const judgeScoreSchema = Joi.object({
    eventId: Joi.number().required().messages({
        "number.base": "Event ID must be a number.",
        "string.empty": "Event ID is required.",
        "any.required": "Event ID is required.",
    }),
    awardId: Joi.number().required().messages({
        "number.base": "Award Cat ID must be a number",
        "any.required": "Award Cat ID is required",
        "number.empty": "Award Cat ID is not allowed to be empty",
    }),
    roundId: Joi.number().required().messages({
        "number.base": "Round ID must be a number",
        "any.required": "Round ID is required ",
        "number.empty": "Round ID is not allowed to be empty.",
    }),
    judgeId: Joi.number().required().messages({
        "number.base": "judge ID must be a number",
        "any.required": "judge ID is required ",
        "number.empty": "judge ID is not allowed to be empty.",
    }),
    submission_id: Joi.string().required().messages({
        'string.base': 'submission_id must be a string.',
        'any.required': 'submission_id is required.',
    }),
    abstain: Joi.number().valid(0, 1).allow('', null).optional().messages({
        "number.base": "Abstain status must be a number (0 or 1).",
        "any.only": "Abstain status must be 0 or 1.",
    }),
    comment: Joi.string().allow('', null).optional().messages({
        'string.base': 'Comment must be a string',
    }),    
    total: Joi.number().allow('', null).optional().messages({
        'number.base': 'Total must be a number'
    }),
    is_pending: Joi.number().valid(0, 1).optional().messages({
        "number.base": "Pending status must be a number (0 or 1).",
        "any.only": "Pending status must be 0 or 1.",
    }),
    is_completed: Joi.number().valid(0, 1).optional().messages({
        "number.base": "Completed status must be a number (0 or 1).",
        "any.only": "Completed status must be 0 or 1.",
    }),
    is_confirmed: Joi.number().valid(0, 1).optional().messages({
        "number.base": "Confirmed status must be a number (0 or 1).",
        "any.only": "Confirmed status must be 0 or 1.",
    }),

    criteria: Joi.array().items(Joi.object({
        score: Joi.number().required().messages({
            'any.required': 'Score is required',
            'number.base': 'Score must be a number'
        }),
        score_title: Joi.string().optional().messages({
            'any.required': 'Score title is required',
            'string.base': 'Score title must be a string'
        }),
        score_comment: Joi.string().allow('', null).optional().messages({
            'string.base': 'Score comment must be a string'
        }),
        is_pending: Joi.number().valid(0, 1).optional().messages({
            "number.base": "Pending status must be a number (0 or 1).",
            "any.only": "Pending status must be 0 or 1.",
        }),
        is_completed: Joi.number().valid(0, 1).optional().messages({
            "number.base": "Completed status must be a number (0 or 1).",
            "any.only": "Completed status must be 0 or 1.",
        }),
        is_confirmed: Joi.number().valid(0, 1).optional().messages({
            "number.base": "Confirmed status must be a number (0 or 1).",
            "any.only": "Confirmed status must be 0 or 1.",
        }),
    })
    ).optional().messages({
        'any.required': 'Criteria is required and must be an array',
        'array.base': 'Criteria must be an array'
    })
});


export const validateScore = (req, res, next) => {
    const { error } = judgeScoreSchema.validate(req.body);

    if (error) {
        return res.status(400).json({
            status: resposne.successFalse,
            message: error.details[0].message
        });
    }

    next();
};
