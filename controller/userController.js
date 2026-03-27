const saltRounds = 10
import bcrypt from "bcrypt"
import resposne from "../middleware/resposne.js"
import {
    changeforgetPassword,
    changePassword,
    checkemail,
    checkemailOtp,
    checkeventId,
    checkphone,
    checkVerified,
    deleteShortlistData,
    entryDataFetch,
    entryFieldsFetch,
    entryFieldsFetchUser,
    eventPriceGet,
    getCouponCodes,
    getMyEvents,
    getPendingOrderDetails,
    GetUserSubmission,
    getUserSubmissionData,
    GetUserSubmissionList,
    loginUser,
    PaymentType,
    sendPendingPaymentEmail,
    storeOTP,
    UserPaymentsGet,
    UserProfileget,
    userRegister,
    verifyOTP,
    verifyUser
} from "../service/userService.js"
import sendGmailotp from "../mails/sendOtp.js"
import otpGenerator from "otp-generator"
import sendGmailAssign from "../mails/createUsermail.js"
import connection from "../database/connection.js"
import sendPendingPaymentaaaaaa from "../mails/pending.js"


export const usercreate = async (req, res) => {
    const { first_name, last_name, email, password, company, mobile_number, country } = req.body;

    try {
        const emailcheck = await checkemail(email);
        if (emailcheck) {
            return res.status(400).json({
                status: resposne.successFalse,
                message: resposne.checkEmail,
            });
        }

        const phone = await checkphone(mobile_number);
        if (phone) {
            return res.status(400).json({
                status: resposne.successFalse,
                message: resposne.checkphone,
            });
        }

        const hashedPassword = await bcrypt.hash(password, saltRounds);

        const userid = await userRegister(first_name, last_name, email, hashedPassword, company, mobile_number, country);
        if (!userid) {
            return res.status(400).json({
                status: resposne.successFalse,
                message: resposne.usercreatefail,
            });
        }

        try {
            const emailResult = await sendGmailAssign(first_name, last_name, email);
            if (emailResult) {
                return res.status(200).json({
                    status: resposne.successTrue,
                    message: resposne.usercreate,
                    userId: userid
                });
            }
        } catch (emailError) {
            return res.status(400).json({
                status: resposne.successFalse,
                message: resposne.usercreateEmailFail,
                emailError: emailError.message,
            });
        }

    } catch (error) {
        return res.status(400).json({
            status: resposne.successFalse,
            message: error.message,
        });
    }
};

export const loginuser = async (req, res) => {
    const { email, password } = req.body

    const emailExists = await checkemail(email)

    if (!emailExists) {
        return res.status(400).json({
            status: resposne.successFalse,
            message: resposne.emailnotexist
        })
    }
    const isVerified = await checkVerified(email)

    if (!isVerified) {
        return res.status(400).json({
            status: resposne.successFalse,
            message: "Email not verified. Please verify your email to login."
        })
    }
    try {

        const loginResult = await loginUser(email, password)

        if (loginResult.data) {
            return res.status(200).json({
                status: resposne.successTrue,
                message: resposne.userlginsuccess,
                data: loginResult.data,
            })
        } else {
            return res.status(400).json({
                status: resposne.successFalse,
                message: loginResult.error,
            })
        }
    } catch (error) {
        // console.error("Error during login:", error)
        return res.status(400).json({
            status: resposne.successFalse,
            message: error.message,
        })
    }
}


export const sendOTP = async (req, res) => {
    const { email } = req.body
    const emailExists = await checkemail(email)

    if (!emailExists) {
        return res.status(400).json({
            status: resposne.successFalse,
            message: resposne.emailnotexist,
        })
    }

    try {
        const otp = otpGenerator.generate(6, {
            digits: resposne.successTrue,
            lowerCaseAlphabets: resposne.successFalse,
            upperCaseAlphabets: resposne.successFalse,
            specialChars: resposne.successFalse,
        })


        const storedotp = await storeOTP(email, otp)
        if (storedotp.length === 0) {
            return res.status(400).json({
                status: resposne.successFalse,
                message: resposne.otpstorefailed,
            })
        }
        const sendotpemail = await sendGmailotp(email, otp)

        if (sendotpemail) {
            return res.status(400).json({
                status: resposne.successFalse,
                message: "Error while sending OTP to email.",
            })
        }


        return res.status(200).json({
            status: resposne.successTrue,
            message: resposne.otpsend,
        })

    } catch (error) {
        return res.status(400).json({
            status: resposne.successFalse,
            message: error.message,
        })
    }
}


export const verifyOTPHandler = async (req, res) => {
    const { email, otp } = req.body
    const emailExists = await checkemail(email)

    if (!emailExists) {
        return res.status(400).json({
            status: resposne.successFalse,
            message: resposne.emailnotexist,
        })
    }
    try {
        const verifiedotp = await verifyOTP(email, otp)

        if (verifiedotp.length === 0) {
            res.status(400).json({
                status: resposne.successFalse,
                message: resposne.otpverifyfailed,
            })
        } else {
            res.status(200).json({
                status: resposne.successTrue,
                message: resposne.otpverified,
            })
        }

    } catch (error) {
        res.status(400).json({
            status: resposne.successFalse,
            message: error.message,
        })
    }
}


export const updatePassword = async (req, res) => {

    const { email, password } = req.body
    const emailExists = await checkemailOtp(email)

    if (!emailExists) {
        return res.status(400).json({
            status: resposne.successFalse,
            message: resposne.otpnotverified,
        })
    }
    try {


        const result = await changePassword({ email, password })

        if (result.length > 0) {
            res.status(200).json({
                status: resposne.successTrue,
                message: result,
            })
        } else {
            res.status(400).json({
                status: resposne.successFalse,
                message: resposne.errorchangePass,
            })

        }
    } catch (error) {
        res.status(400).json({
            status: resposne.successFalse,
            message: error.message,
        })
    }
}

export const updateforgetPassword = async (req, res) => {
    const { email, newPassword, confirmPassword } = req.body

    const emailExists = await checkemailOtp(email)
    if (!emailExists) {
        return res.status(400).json({
            status: resposne.successFalse,
            message: resposne.otpnotverified,
        })
    }

    if (newPassword !== confirmPassword) {
        return res.status(400).json({
            status: resposne.successFalse,
            message: resposne.newPass,
        })
    }

    try {
        const result = await changeforgetPassword({ email, newPassword })

        if (result.length === 0) {
            return res.status(400).json({
                status: resposne.successFalse,
                message: resposne.errorchangePass,
            })
        } else {
            return res.status(200).json({
                status: resposne.successTrue,
                message: resposne.passupdateSuccess,
            })
        }

    } catch (error) {
        return res.status(400).json({
            status: resposne.successFalse,
            message: error.message,
        })
    }
}

export const CouponCodesget = async (req, res) => {

    const role = req.user.role

    if (role !== "user") {
        return res.status(400).json({
            status: resposne.successFalse,
            message: resposne.unauth,
        })
    }
    const eventId = req.params.id

    const eventIdCheck = await checkeventId(eventId)
    if (!eventIdCheck) {
        return res.status(400).json({
            status: resposne.successFalse,
            message: resposne.eventIdfail,
        })
    }
    try {

        const result = await getCouponCodes(eventId)
        if (result.length === 0) {
            res.status(400).json({
                status: resposne.successFalse,
                message: resposne.nodatavail,
            })
        } else {
            res.status(200).json({
                status: resposne.successTrue,
                message: resposne.fetchSuccess,
                data: result,
            })
        }
    } catch (error) {
        res.status(400).json({
            status: resposne.successFalse,
            message: error.message,
        })
    }
}

export const getSubmissionsData = async (req, res) => {
    const { eventId, search, limit, skip, submission_id } = req.query;

    const eventIdCheck = await checkeventId(eventId);
    if (!eventIdCheck) {
        return res.status(400).json({
            status: resposne.successFalse,
            message: resposne.eventIdfail,
        });
    }

    const searchTerm = search?.trim() || null;
    const limitValue = parseInt(limit, 10) > 0 ? parseInt(limit, 10) : 10;
    const skipValue = parseInt(skip, 10) >= 0 ? parseInt(skip, 10) : 0;

    try {
        const entryFields = await entryFieldsFetch(eventId);

        const entrySubmissions = await entryDataFetch(eventId, searchTerm, limitValue, skipValue, submission_id);

        const totalCount = entrySubmissions.length;

        return res.status(200).json({
            status: resposne.successTrue,
            message: resposne.fetchSuccess,
            data: {
                formSchema: entryFields.data,
                entrySubmissions,
            },
            totalCount
        });

    } catch (error) {
        return res.status(400).json({
            status: resposne.successFalse,
            message: error.message
        });
    }
};

export const verifyUserHandler = async (req, res) => {
    const { email } = req.query;

    const emailExists = await checkemail(email);

    if (!emailExists) {
        return res.status(400).json({
            status: resposne.successFalse,
            message: resposne.emailnotexist,
        });
    }

    try {
        const isVerified = await verifyUser(email);

        if (isVerified) {
            res.status(200).json({
                status: resposne.successTrue,
                message: resposne.userVerifySuccess,
            });
        } else {
            res.status(400).json({
                status: resposne.successFalse,
                message: resposne.userVerifyFalse,
            });
        }

    } catch (error) {
        res.status(400).json({
            status: resposne.successFalse,
            message: error.message,
        });
    }
};




  
  export const getUserEventEntries = async (req, res) => {
    const userId = req.user.id; // Assuming you have user ID from authentication middleware

    try {
     
      const entries = await entryFieldsFetchUser(userId);
      res.status(200).json({ success: true, data: entries });
    } catch (error) {
      console.error("Error fetching entries:", error);
      res.status(500).json({ success: false, message: "Internal Server Error" });
    }
  };


  export const paymentCreate = async (req, res) => {
    const { role } = req.user;

    if (role !== "user") {
        return res.status(400).json({
            status: resposne.successFalse,
            message: resposne.unauth,
        });
    }
    const userId = req.user.id;

    const {
        eventId,
        awardId,
        couponId,
        payment_price,
        payment_status,
        company_name,
        gst_number
    } = req.body;

    const eventIdCheck = await checkeventId(eventId);
    if (!eventIdCheck) {
        return res.status(400).json({
            status: resposne.successFalse,
            message: resposne.eventIdfail,
        });
    }
    try {
        const result = await addPayment(
            userId,
            eventId,
            awardId,
            couponId,
            payment_price,
            payment_status,
            company_name,
            gst_number
        );

        if (result.length === 0) {
            return res.status(400).json({
                status: resposne.successFalse,
                message: resposne.paymentfail,
            });
        } else {
            return res.status(200).json({
                status: resposne.successTrue,
                message: resposne.paymentSuccess,
                paymentDetailId: result.id,
            });
        }
    } catch (error) {
        return res.status(400).json({
            status: resposne.successFalse,
            message: error.message,
        });
    }
};


export const MyEventsgetUser = async (req, res) => {
    const role = req.user.role;
    
    if (role !== "user") {
        return res.status(400).json({
            status: resposne.successFalse,
            message: resposne.unauth, 
        });
    }

    const userId = req.user.id; 
  
    try {
        const result = await getMyEvents(userId);
  
        if (result.length === 0) {
            return res.status(400).json({ 
                status: resposne.successFalse,
                message: resposne.nodatavail,  
            });
        } else {
            return res.status(200).json({
                status: resposne.successTrue,
                message: resposne.fetchSuccess, 
                data: result,  
            });
        }
    } catch (error) {

        return res.status(400).json({
            status: resposne.successFalse,
            message: error.message, 
        });
    }
};

export const GettotalScore = async (req, res) => {
    const role = req.user.role;
  
    if (role !== "user") {
      return res.status(400).json({
        status: resposne.successFalse,
        message: resposne.unauth,
      });
    }
  
    const created_by = req.user.id;
  
    try {
      const result = await eventPriceGet(created_by, role);
  
      if (result.length === 0) {
        return res.status(400).json({
          success: resposne.successFalse,
          message: "No data found for the given user.",
        });
      }
  
      return res.status(200).json({
        success: resposne.successTrue,
        message: "Price fetched successfully.",
        data: result,
      });
    } catch (error) {
      return res.status(400).json({
        success: resposne.successFalse,
        error: error.message
      });
    }
  };
  

  export const getUserData = async (req, res) => {
    const userId = req.user.id; // Assuming you have user ID from authentication middleware
    const { eventId } = req.query;
  
    if (!eventId || !userId) {
      return res.status(400).json({ status: false, message: "Provide eventId and userId." });
    }
  
    try {
        const paymentData = await PaymentType(eventId);
      const results = await getUserSubmissionData(eventId, userId);
  
      if (results.length === 0) {
        return res.status(404).json({ status: false, message: "No data found for this event and user." });
      }
  
      let totalSubmissions = 0;
      let totalPayment = 0;
      const categoryWiseData = results.map(category => {
        totalSubmissions += category.total_submissions;
        totalPayment += category.total_payment;
        return {
          categoryId: category.category_id,
          categoryName: category.category_name || "Uncategorized",
          totalSubmissions: category.total_submissions,
          totalPayment: category.total_payment
        };
      });
  
      return res.status(200).json({
        status: true,
        eventId,
        userId,
        paymentData:paymentData[0] || null,
        categories: categoryWiseData,
        totalSubmissions,
        totalPayment
      });
  
    } catch (error) {
      return res.status(500).json({ status: false, message: "Server error: " + error.message });
    }
  };
  
  
  
  


  export const sendPendingPayment = async (req, res) => {
    try {
      const { eventid,userId } = req.query;
       console.log("eventid",eventid)
      // Fetch order details
      const order = await getPendingOrderDetails(eventid,userId);
      if (!order) {
        return res.status(404).json({ success: false, message: "Order not found or not pending." });
      }
  
      // Send email
      await sendPendingPaymentaaaaaa(order,eventid,userId);
  
      res.status(200).json({ success: true, message: "Pending payment email sent successfully." });
    } catch (error) {
      console.error("Error sending pending payment email:", error);
      res.status(500).json({ success: false, message: "Internal server error." });
    }
}



export const UserSubMission = async (req, res) => {
    const role = req.user.role;
    
    if (role !== "user") {
        return res.status(400).json({
            status: resposne.successFalse,
            message: resposne.unauth, 
        });
    }

    const userId = req.user.id; 
  
    try {
        const result = await GetUserSubmission(userId);
  
        if (result.length === 0) {
            return res.status(400).json({ 
                status: resposne.successFalse,
                message: resposne.nodatavail,  
            });
        } else {
            return res.status(200).json({
                status: resposne.successTrue,
                message: resposne.fetchSuccess, 
                data: result,  
            });
        }
    } catch (error) {

        return res.status(400).json({
            status: resposne.successFalse,
            message: error.message, 
        });
    }
};




export const UserPaymentHistory = async (req, res) => {
   
    const role = req.user.role;
    const userId = req.user.id;   
    
    if (role !== "user") {
        return res.status(400).json({
            status: resposne.successFalse,
            message: resposne.unauth, 
        });
    }

    try {
        const result = await UserPaymentsGet(userId);
  
        if (result.length === 0) {
            return res.status(400).json({ 
                status: resposne.successFalse,
                message: resposne.nodatavail,  
            });
        } else {
            return res.status(200).json({
                status: resposne.successTrue,
                message: resposne.fetchSuccess, 
                data: result,  
            });
        }
    } catch (error) {

        return res.status(400).json({
            status: resposne.successFalse,
            message: error.message, 
        });
    }
};




export const UserProfilegets = async (req, res) => {
   
    const role = req.user.role;
    const userId = req.user.id;   
    
    if (role !== "user") {
        return res.status(400).json({
            status: resposne.successFalse,
            message: resposne.unauth, 
        });
    }

    try {
        const result = await UserProfileget(userId);
  
        if (result.length === 0) {
            return res.status(400).json({ 
                status: resposne.successFalse,
                message: resposne.nodatavail,  
            });
        } else {
            return res.status(200).json({
                status: resposne.successTrue,
                message: resposne.fetchSuccess, 
                data: result,  
            });
        }
    } catch (error) {

        return res.status(400).json({
            status: resposne.successFalse,
            message: error.message, 
        });
    }
};




export const UserSubMissionList = async (req, res) => {
    const role = req.user.role;
    
    if (role !== "user") {
        return res.status(400).json({
            status: resposne.successFalse,
            message: resposne.unauth, 
        });
    }

    const userId = req.user.id; 
  
    try {
        const result = await GetUserSubmissionList(userId);
  
        if (result.length === 0) {
            return res.status(400).json({ 
                status: resposne.successFalse,
                message: resposne.nodatavail,  
            });
        } else {
            return res.status(200).json({
                status: resposne.successTrue,
                message: resposne.fetchSuccess, 
                data: result,  
            });
        }
    } catch (error) {

        return res.status(400).json({
            status: resposne.successFalse,
            message: error.message, 
        });
    }
};


export const UserWithdrawl = async (req, res) => {
  const { eventId, submissionId } = req.body;

  if (!eventId || !submissionId) {
    return res.status(400).json({
      status: resposne.successFalse,
      message: "eventId and submissionId are required"
    });
  }

  try {
    const result = await deleteShortlistData(eventId, submissionId);

    return res.status(200).json({
      status: resposne.successTrue,
      message: "Shortlist data deleted successfully",
      data: result
    });

  } catch (error) {
    console.error("Delete shortlist_data error:", error.message);

    const message = error.message === "No matching records found to delete"
      ? error.message
      : "Internal Server Error";

    return res.status(400).json({
      status: resposne.successFalse,
      message
    });
  }
};
