const saltRounds = 10;
import bcrypt from "bcrypt";
import {
  adminRegister,
  changeforgetPassword,
  checkemail,
  checkemailOtp,
  checkeventId,
  checkphone,
  createAward,
  createEvent,
  exportToExcel,
  getAwards,
  getEventDashboard,
  getMyEvents,
  loginAdmin,
  storeOTP,
  updateprofile,
  verifyOTP,
  newPasswordd,
  checkCurrentPass,
  updateAward,
  softDeleteAward,
  checkifDeleted,
  industry_types,
  updateEventDetails,
  getEventById,
  updateEventSocial,
  addSubmissionId,
  publiclyVisible,
  generalSettings,
  AssignJury,
  getAdminProfile,
  createCoupon,
  checkAdmin,
  checkeventEmail,
  additional_emailssss,
  getAwardById,
  checkAwardId,
  EmptyStartDate,
  EmptyEndDate,
  createRegistrationFormService,
  getRegistrationFormService,
  updateRegistrationFormService,
  createEntryFormService,
  getEntryFormService,
  updateEntryFormService,
  searchEvent,
  checkifAlreadyVisible,
  checkRegFormId,
  checkentryFormId,
  updateAdditionalEmails,
  statusEvent,
  updatedIndustryTypes,
  getgeneralSettings,
  updateGeneralSettings,
  checkeventIdSettings,
  createScorecaRD,
  checkroundId,
  getscorecardService,
  checkScorecardFormId,
  getRoundById,
  checkScorecardEventId,
  roundAwardCategory,
  checkeventIdScore,
  checkroundIdScore,
  getScorecards,
  softDeleteScorecard,
  checkIfScoreFormDeleted,
  getAssignedJury,
  checkeventIdAssign,
  checkroundIdAssignJury,
  updateScorecardcategories,
  updateScorecardService,
  getAssignJury,
  checkeventIdJuryAssign,
  checkroundIdJuryAssign,
  softDeleteJuryAssign,
  softDeleteJuryAssignGrps,
  checkIfScoreFormCategoriesDeleted,
  softDeleteCategiesScorecard,
  checkJuryAssignId,
  groupNameCreate,
  updatedgroupName,
  updateAssignjury,
  checkJuryAssignidGroup,
  getEventByUrlKey,
  getEventByUniqueUrlKey,
  checkuser,
  submitRegistrationDataService,
  checkSCOREFormIdCategory,
  checkadminIdEvent,
  getEventRoundData,
  exportJuryAssign,
  awardcategoryprewfixget,
  generateSubmissionValue1,
  generateSubmissionValue2,
  PredefineSubimissionIdGet,
  generateSubmissionValue3,
  fetchCaseValueFromDatabase,
  insertEntryDataIntoDatabase,
  checkawardCatId,
  fetchLastSubmissionId,
  fetchUniqueSubmissionIds,
  fetchFieldsForSubmission,
  insertShortlistData,
  checkSubmissionId,
  shortlistFetch,
  checkAllocation,
  checkSubmissionExists,
  insertAllocation,
  // updateAllocation,
  customAllocationFetch,
  registrationDataFetch,
  registrationFieldsFetch,
  fetchFormSchema,
  generateExcelFile,
  groupRegistrationData,
  exportRegistrationData,
  fetchAbstained,
  entryDataFetch,
  entryFieldsFetch,
  generateMergedExcelFile,
  fetchData,
  softDeleteShortlist,
  checkSubIdShortlist,
  deleteAllocation,
  adminData,
  registerUserUpdate,
  registrationDataFetchById,
  entryDataFetchById,
  entrantsDataUpdate,
  checkFormExists,
  checkEntryFormExists,
  createJuryGroup,
  insertAwardCategories,
  insertSubmissionFields,
  insertSubmissionFieldValues,
  insertEntrantFields,
  insertEntrantFieldValues,
  insertSubmissionIds,
  commitTransaction,
  rollbackTransaction,
  releaseConnection,
  GetAlljudgeGroup,
  checkgroupId,
  GroupGetById,
  deleteJuryGroupById,
  backdoorGet,
  deletebackdoor,
  checkBackdoor,
  getEntryData,
  generateExcel,
  checkEventRegistration,
  getEventsByAdmin,
  deleteExistingSubmissions,
  getAllAdmins,
  adminblocking,
  checkblock,
  checkjuryMail,
  getJuryProgress,
  shortlistFetchno,
  coupongetAdmin,
  fetchFieldsForSubmissiontest,
  getGeneralSettingsByEventId,
  Couponget,
  checkScorecardExistsNot,
  CouponDelete,
  CouponUpdate,
  checkSubmissionIdAndDeleteIfShortlisted,
  getPaymentGateway,
  getShortlistedEntries,
  getJuryEmailsByEventAndRound,
  entrydatagetSubmission,
  getJuryScore,
  getJuryEmailsByIds,
  eventdetails,
  createScorecaRD1,
  eventaddititonalemail,
  eventscoreget,
  checkawardCatIdNew,
  getSubmissionLimit,
  countSubmissions,
  UserCatgeoryFormList,
  checkIfEventPlanExists,
  updateMediaSubmissionId,
} from "../service/adminService.js";
import resposne from "../middleware/resposne.js";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import otpGenerator from "otp-generator";
import sendGmailAssign from "../mails/mail.js";
import sendGmailotp from "../mails/sendOtp.js";
import ExcelJS from "exceljs";
import sendGmailAssignJudge from "../mails/mail.js";
import connection1 from "../database/connectionmysql2.js";
import excelJS from "exceljs";
import connection from "../database/connection.js";
import { response } from "express";
import sendRegistrationAcknowledgement from "../mails/registerationform.js";
import Submissiondetail from "../mails/Submissiondetail.js";

export const usercreate = async (req, res) => {
  const {
    first_name,
    last_name,
    email,
    password,
    company,
    mobile_number,
    country,
  } = req.body;

  const role = "superadmin";

  if (role !== "superadmin") {
    return res.status(400).json({
      status: resposne.successFalse,
      message: "Access Denied",
    });
  }
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

  try {
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const userid = await adminRegister(
      first_name,
      last_name,
      email,
      hashedPassword,
      company,
      mobile_number,
      country,
    );

    if (userid.length === 0) {
      return res.status(400).json({
        status: resposne.successFalse,
        message: resposne.adminfailed,
      });
    } else {
      return res.status(200).json({
        status: resposne.successTrue,
        message: resposne.admincreate,
      });
    }
  } catch (error) {
    return res.status(400).json({
      status: resposne.successFalse,
      message: error.message,
    });
  }
};

export const loginseller = async (req, res) => {
  const { email, password } = req.body;
  const emailExists = await checkemail(email);

  if (!emailExists) {
    return res.status(400).json({
      status: resposne.successFalse,
      message: resposne.emailnotexist,
    });
  }
  const blockCheck = await checkblock(email);

  if (blockCheck) {
    return res.status(400).json({
      status: resposne.successFalse,
      message: resposne.youareblocked,
    });
  }
  try {
    const loginResult = await loginAdmin(email, password);
    if (loginResult.error) {
      return res.status(400).json({
        status: resposne.successFalse,
        message: loginResult.error,
      });
    } else {
      return res.status(200).json({
        status: resposne.successTrue,
        message: resposne.adminlginsuccess,
        data: loginResult.data,
      });
    }
  } catch (error) {
    return res.status(400).json({
      status: resposne.successFalse,
      message: error.message,
    });
  }
};

export const updateProfile = async (req, res) => {
  const role = req.user.role;
  const userId = req.user.id;

  if (role !== "admin") {
    return res.status(400).json({
      status: resposne.successFalse,
      message: resposne.unauth,
    });
  }
  const {
    first_name,
    last_name,
    email,
    company,
    mobile_number,
    time_zone,
    job_title,
  } = req.body;
  const profile_image = req.file;

  try {
    const updates = {};

    if (first_name) updates.first_name = first_name;
    if (last_name) updates.last_name = last_name;
    if (email) updates.email = email;
    if (company) updates.company = company;
    if (mobile_number) updates.mobile_number = mobile_number;
    if (time_zone) updates.time_zone = time_zone;
    if (job_title) updates.job_title = job_title;
    if (profile_image) updates.imageFilename = profile_image.filename;

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({
        status: resposne.successFalse,
        message: resposne.noupdate,
      });
    }

    const result = await updateprofile(updates, userId);
    if (result.length === 0) {
      res.status(400).json({
        status: resposne.successFalse,
        message: resposne.updateFail,
      });
    } else {
      res.status(200).json({
        status: resposne.successTrue,
        message: resposne.updateSuccess,
      });
    }
  } catch (error) {
    res.status(400).json({
      status: resposne.successFalse,
      message: error.message,
    });
  }
};

export const sendOTP = async (req, res) => {
  const { email } = req.body;
  const emailExists = await checkemail(email);

  if (!emailExists) {
    return res.status(400).json({
      status: resposne.successFalse,
      message: resposne.emailnotexist,
    });
  }

  try {
    const otp = otpGenerator.generate(6, {
      digits: resposne.successTrue,
      lowerCaseAlphabets: resposne.successFalse,
      upperCaseAlphabets: resposne.successFalse,
      specialChars: resposne.successFalse,
    });

    const storedotp = await storeOTP(email, otp);
    if (storedotp.length === 0) {
      return res.status(400).json({
        status: resposne.successFalse,
        message: resposne.otpstorefailed,
      });
    }
    const sendotpemail = await sendGmailotp(email, otp);

    if (sendotpemail) {
      return res.status(400).json({
        status: resposne.successFalse,
        message: resposne.sendError,
      });
    }

    return res.status(200).json({
      status: resposne.successTrue,
      message: resposne.otpsend,
    });
  } catch (error) {
    return res.status(400).json({
      status: resposne.successFalse,
      message: error.message,
    });
  }
};

export const verifyOTPHandler = async (req, res) => {
  const { email, otp } = req.body;
  const emailExists = await checkemail(email);

  if (!emailExists) {
    return res.status(400).json({
      status: resposne.successFalse,
      message: resposne.emailnotexist,
    });
  }
  try {
    const verifiedotp = await verifyOTP(email, otp);

    if (verifiedotp.length === 0) {
      res.status(400).json({
        status: resposne.successFalse,
        message: resposne.otpverifyfailed,
      });
    } else {
      res.status(200).json({
        status: resposne.successTrue,
        message: resposne.otpverified,
      });
    }
  } catch (error) {
    res.status(400).json({
      status: resposne.successFalse,
      message: error.message,
    });
  }
};

export const updateforgetPassword = async (req, res) => {
  const { email, newPassword, confirmPassword } = req.body;

  const emailExists = await checkemailOtp(email);
  if (!emailExists) {
    return res.status(400).json({
      status: resposne.successFalse,
      message: resposne.otpnotverified,
    });
  }

  if (newPassword !== confirmPassword) {
    return res.status(400).json({
      status: resposne.successFalse,
      message: resposne.newPass,
    });
  }

  try {
    const result = await changeforgetPassword({ email, newPassword });

    if (result.length === 0) {
      return res.status(400).json({
        status: resposne.successFalse,
        message: resposne.errorchangePass,
      });
    } else {
      return res.status(200).json({
        status: resposne.successTrue,
        message: resposne.passupdateSuccess,
      });
    }
  } catch (error) {
    return res.status(400).json({
      status: resposne.successFalse,
      message: error.message,
    });
  }
};

export const eventCreate = async (req, res) => {
  const role = req.user.role;

  if (role !== "admin") {
    return res.status(400).json({
      status: resposne.successFalse,
      message: resposne.unauth,
    });
  }

  const adminId = req.user.id;
  const adminExists = await checkAdmin(adminId);
  if (!adminExists) {
    return res.status(400).json({
      status: resposne.successFalse,
      message: resposne.noadmin,
    });
  }

  const {
    event_name,
    closing_date,
    closing_time,
    email,
    event_url,
    time_zone,
    is_endorsement,
    is_withdrawal,
    is_ediit_entry,
    limit_submission,
    submission_limit,
    event_description,
    industry_type,
    additional_email,
  } = req.body;

  // const checkEmail = await checkeventEmail(email);
  // if (checkEmail) {
  //   return res.status(400).json({
  //     status: resposne.successFalse,
  //     message: resposne.checkEmail,
  //   });
  // }

  try {
    if (
      limit_submission === 1 &&
      (submission_limit === undefined || submission_limit < 1)
    ) {
      return res.status(400).json({
        status: resposne.successFalse,
        message: resposne.submisionlimit,
      });
    }

    const logo = req.files["event_logo"]
      ? req.files["event_logo"][0].filename
      : null;
    const banner = req.files["event_banner"]
      ? req.files["event_banner"][0].filename
      : null;

    if (!logo && !banner) {
      console.warn("Both logo and banner are not provided.");
    }

    const eventResult = await createEvent(
      adminId,
      event_name,
      closing_date,
      closing_time,
      email,
      event_url,
      time_zone,
      is_endorsement,
      is_withdrawal,
      is_ediit_entry,
      limit_submission,
      submission_limit,
      logo,
      banner,
      event_description,
    );

    if (additional_email && additional_email.length > 0) {
      try {
        const emailCreateResult = await additional_emailssss(
          eventResult.id,
          additional_email,
        );
        if (emailCreateResult.error) {
          return res.status(400).json({
            status: resposne.successFalse,
            message: emailCreateResult.error.message,
          });
        }
      } catch (error) {
        return res.status(400).json({
          status: resposne.successFalse,
          message: error.message,
        });
      }
    }

    if (industry_type && industry_type.length > 0) {
      try {
        const industryCreateResult = await industry_types(
          eventResult.id,
          industry_type,
        );
        if (industryCreateResult.error) {
          return res.status(400).json({
            status: resposne.successFalse,
            message: industryCreateResult.error.message,
          });
        }
      } catch (error) {
        return res.status(400).json({
          status: resposne.successFalse,
          message: error.message,
        });
      }
    }

    return res.status(200).json({
      status: resposne.successTrue,
      message: resposne.createvent,
      eventId: eventResult.id,
    });
  } catch (error) {
    return res.status(400).json({
      status: resposne.successFalse,
      message: error.message,
    });
  }
};

export const awardCreate = async (req, res) => {
  const { role } = req.user;

  if (role !== "admin") {
    return res.status(400).json({
      status: resposne.successFalse,
      message: resposne.unauth,
    });
  }

  const {
    eventId,
    category_name,
    category_prefix,
    belongs_group,
    limit_submission,
    is_start_date,
    is_end_date,
    is_endorsement,
    start_date,
    end_date,
    payment_price,
  } = req.body;

  const eventIdCheck = await checkeventId(eventId);
  if (!eventIdCheck) {
    return res.status(400).json({
      status: resposne.successFalse,
      message: resposne.eventIdfail,
    });
  }

  if (is_start_date === 1 && (!start_date || start_date < 1)) {
    return res.status(400).json({
      status: resposne.successFalse,
      message: resposne.is_start_REquired,
    });
  }

  if (is_end_date === 1 && (!end_date || end_date < 1)) {
    return res.status(400).json({
      status: resposne.successFalse,
      message: resposne.is_end_REquired,
    });
  }

  try {
    const result = await createAward(
      eventId,
      category_name,
      category_prefix,
      belongs_group,
      limit_submission,
      is_start_date,
      is_end_date,
      is_endorsement,
      start_date,
      end_date,
      payment_price,
    );

    if (result.length === 0) {
      return res.status(400).json({
        status: resposne.successFalse,
        message: resposne.awardcreatefail,
      });
    } else {
      return res.status(200).json({
        status: resposne.successTrue,
        message: resposne.awardcreate,
        awardId: result.id,
      });
    }
  } catch (error) {
    return res.status(400).json({
      status: resposne.successFalse,
      message: error.message,
    });
  }
};

export const Awardsget = async (req, res) => {
  const { eventId, search, sortOrder } = req.query;
  const searchTerm = search && search.trim() !== "" ? search : null;
  const order = sortOrder === "oldest" ? "oldest" : "newest";

  try {
    const result = await getAwards(eventId, searchTerm, order);

    if (result.length > 0) {
      return res.status(200).json({
        status: resposne.successTrue,
        message: resposne.fetchSuccess,
        data: result,
      });
    } else {
      return res.status(400).json({
        status: resposne.successFalse,
        message: resposne.nodatavail,
      });
    }
  } catch (error) {
    return res.status(400).json({
      status: resposne.successFalse,
      message: error.message,
    });
  }
};

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const directoryPath = path.resolve(__dirname, "../files");

if (!fs.existsSync(directoryPath)) {
  fs.mkdirSync(directoryPath);
}

export const exportCsv = async (req, res) => {
  try {
    const eventId = req.query.eventId;

    if (!eventId) {
      return res.status(400).json({
        status: resposne.successFalse,
        message: resposne.eventIdfail,
      });
    }

    const products = await exportToExcel(eventId);

    if (!products || products.length === 0) {
      return res.status(400).json({
        status: resposne.successFalse,
        message: resposne.nodataDownload,
      });
    }

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Products");

    worksheet.columns = [
      { header: "ID", key: "awardId", width: 5 },
      { header: "Event ID", key: "eventId", width: 12 },
      { header: "Category Name", key: "category_name", width: 20 },
      { header: "Category Prefix", key: "category_prefix", width: 10 },
      { header: "Belongs Group", key: "belongs_group", width: 20 },
      { header: "Limit Submission", key: "limit_submission", width: 20 },
      { header: "Closing Date", key: "end_date", width: 25 },
    ];

    products.forEach((product) => {
      worksheet.addRow(product);
    });

    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    );
    res.setHeader("Content-Disposition", "attachment filename=products.xlsx");

    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    res.status(400).json({
      status: resposne.successFalse,
      message: resposne.downloadFail,
      error: error.message,
    });
  }
};

export const dashboardEvents = async (req, res) => {
  const role = req.user.role;
  const id = req.user.id;

  if (role !== "admin") {
    return res.status(400).json({
      status: resposne.successFalse,
      message: resposne.unauth,
    });
  }
  const { skip, limit, sortOrder } = req.query;

  const validSortOrders = ["newest", "oldest"];
  const order = validSortOrders.includes(sortOrder) ? sortOrder : "newest";

  try {
    const parsedSkip = parseInt(skip, 10) || 0;
    const parsedLimit = parseInt(limit, 100) || 100;

    const result = await getEventDashboard(parsedSkip, parsedLimit, id, order);

    if (result.length > 0) {
      return res.status(200).json({
        status: resposne.successTrue,
        message: resposne.fetchSuccess,
        data: result,
      });
    } else {
      return res.status(400).json({
        status: resposne.successFalse,
        message: resposne.nodatavail,
      });
    }
  } catch (error) {
    return res.status(400).json({
      status: resposne.successFalse,
      message: error.message,
    });
  }
};

export const NewPassword = async (req, res) => {
  const role = req.user.role;

  if (role !== "admin") {
    return res.status(400).json({
      status: resposne.successFalse,
      message: resposne.unauth,
    });
  }
  const search = req.query;
  const userId = req.user.id;
  const { currentPassword, newPassword } = req.body;

  const passwordExists = await checkCurrentPass(userId, currentPassword);
  if (passwordExists.error) {
    return res.status(400).json({
      status: resposne.successFalse,
      message: resposne.checkCurrentPass,
    });
  }

  try {
    const result = await newPasswordd({
      userId,
      search,
      currentPassword,
      newPassword,
    });
    if (result.error) {
      return res.status(400).json({
        status: resposne.successFalse,
        message: resposne.newPassFail,
      });
    }
    res.status(200).json({
      status: resposne.successTrue,
      message: result,
    });
  } catch (error) {
    res.status(400).json({
      status: resposne.successFalse,
      message: error.message,
    });
  }
};

export const MyEventsget = async (req, res) => {
  const role = req.user.role;
  const id = req.user.id;

  if (role !== "admin") {
    return res.status(400).json({
      status: resposne.successFalse,
      message: resposne.unauth,
    });
  }

  const { skip, limit, order, status } = req.query; // added status for filtering

  const sortOrder = order === "newest" ? "newest" : "oldest"; // fixed the condition for sorting

  try {
    const result = await getMyEvents(id, sortOrder, statusFilter);

    if (result.totalCount === 0) {
      return res.status(400).json({
        status: resposne.successFalse,
        message: resposne.nodatavail,
      });
    } else {
      return res.status(200).json({
        status: resposne.successTrue,
        message: resposne.fetchSuccess,
        data: result.events,
        totalCount: result.totalCount,
        liveCount: result.liveCount,
        draftCount: result.draftCount,
        archiveCount: result.archiveCount,
      });
    }
  } catch (error) {
    return res.status(400).json({
      status: resposne.successFalse,
      message: error.message,
    });
  }
};

export const awardUpdate = async (req, res) => {
  const { role } = req.user;

  if (role !== "admin") {
    return res.status(400).json({
      status: resposne.successFalse,
      message: resposne.unauth,
    });
  }
  const {
    awardId,
    category_name,
    category_prefix,
    belongs_group,
    limit_submission,
    is_start_date,
    is_end_date,
    is_endorsement,
    start_date,
    end_date,
    payment_price,
  } = req.body;

  const updates = {};

  if (category_name) updates.category_name = category_name;
  if (category_prefix) updates.category_prefix = category_prefix;
  if (belongs_group) updates.belongs_group = belongs_group;
  if (limit_submission !== undefined)
    updates.limit_submission = limit_submission;
  if (is_start_date !== undefined) updates.is_start_date = is_start_date;
  if (is_end_date !== undefined) updates.is_end_date = is_end_date;
  if (is_endorsement !== undefined) updates.is_endorsement = is_endorsement;
  if (start_date !== undefined) updates.start_date = start_date;
  if (end_date !== undefined) updates.end_date = end_date;
  if (payment_price !== undefined) updates.payment_price = payment_price;
  if (Object.keys(updates).length === 0) {
    return res.status(400).json({
      status: resposne.successFalse,
      message: resposne.noupdate,
    });
  }

  try {
    if (is_start_date === 0) {
      await EmptyStartDate(awardId);
    }

    if (is_end_date === 0) {
      await EmptyEndDate(awardId);
    }

    const result = await updateAward(awardId, updates);

    if (result.message) {
      return res.status(200).json({
        status: resposne.successTrue,
        message: resposne.awardUpdateSuccess,
      });
    } else {
      return res.status(400).json({
        status: resposne.successFalse,
        message: resposne.awardUpdateFail,
      });
    }
  } catch (error) {
    return res.status(400).json({
      status: resposne.successFalse,
      message: error.message,
    });
  }
};

export const deleteAward = async (req, res) => {
  const { role } = req.user;

  if (role !== "admin") {
    return res.status(400).json({
      status: resposne.successFalse,
      message: resposne.unauth,
    });
  }

  const awardId = req.params.id;
  const isDeleted = await checkifDeleted(awardId);
  if (isDeleted) {
    return res.status(400).json({
      status: resposne.successFalse,
      message: resposne.awardalreadyDeleted,
    });
  }
  try {
    const message = await softDeleteAward(awardId);
    if (message.affectedRows === 0) {
      return res.status(400).json({
        status: resposne.successFalse,
        message: resposne.deleteAwardError,
      });
    }
    return res.status(200).json({
      status: resposne.successTrue,
      message: resposne.awardDeleted,
    });
  } catch (error) {
    return res.status(400).json({
      status: resposne.successFalse,
      message: error.message,
    });
  }
};

const validateSubmissionLimit = (limit_submission, submission_limit) => {
  if (limit_submission && !submission_limit) {
    return resposne.submisionlimit;
  }
  return null;
};

const getUpdateFields = ({
  event_name,
  closing_date,
  closing_time,
  email,
  event_url,
  time_zone,
  is_endorsement,
  is_withdrawal,
  is_ediit_entry,
  limit_submission,
  submission_limit,
}) => {
  const updates = {};
  if (event_name) updates.event_name = event_name;
  if (closing_date) updates.closing_date = closing_date;
  if (closing_time) updates.closing_time = closing_time;
  if (email) updates.email = email;
  if (event_url) updates.event_url = event_url;
  if (time_zone) updates.time_zone = time_zone;
  if (is_endorsement !== undefined) updates.is_endorsement = is_endorsement;
  if (is_withdrawal !== undefined) updates.is_withdrawal = is_withdrawal;
  if (is_ediit_entry !== undefined) updates.is_ediit_entry = is_ediit_entry;
  if (limit_submission !== undefined)
    updates.limit_submission = limit_submission;
  if (submission_limit !== undefined)
    updates.submission_limit = submission_limit;
  return updates;
};

export const eventUpdate = async (req, res) => {
  const {
    eventId,
    event_name,
    closing_date,
    closing_time,
    email,
    event_url,
    time_zone,
    is_endorsement,
    is_withdrawal,
    is_ediit_entry,
    limit_submission,
    submission_limit,
    additional_email,
    industry_type,
  } = req.body;

  const updates = getUpdateFields({
    event_name,
    closing_date,
    closing_time,
    email,
    event_url,
    time_zone,
    is_endorsement,
    is_withdrawal,
    is_ediit_entry,
    limit_submission,
    submission_limit,
    eventId,
  });

  if (
    Object.keys(updates).length === 0 &&
    !additional_email?.length &&
    !industry_type?.length
  ) {
    return res.status(400).json({
      status: resposne.successFalse,
      message: resposne.novalidfield,
    });
  }

  try {
    const eventExists = await checkeventId(eventId);
    if (!eventExists) {
      return res.status(400).json({
        status: resposne.successFalse,
        message: resposne.eventnotfound,
      });
    }

    const submissionLimitError = validateSubmissionLimit(
      limit_submission,
      submission_limit,
    );
    if (submissionLimitError) {
      return res.status(400).json({
        status: resposne.successFalse,
        message: submissionLimitError,
      });
    }

    if (additional_email?.length) {
      const insertEmailResult = await updateAdditionalEmails(
        eventId,
        additional_email,
      );
      if (insertEmailResult <= 0) {
        return res.status(400).json({
          status: resposne.successFalse,
          message: resposne.insertORUpdateFail,
        });
      }
    }

    if (industry_type?.length) {
      const insertIndustryResult = await updatedIndustryTypes(
        eventId,
        industry_type,
      );
      if (insertIndustryResult <= 0) {
        return res.status(400).json({
          status: resposne.successFalse,
          message: resposne.industrytypeInsertFail,
        });
      }
    }

    if (Object.keys(updates).length > 0) {
      const result = await updateEventDetails(updates, eventId);
      if (result.affectedRows > 0) {
        return res.status(200).json({
          status: resposne.successTrue,
          message: resposne.updateventSuccess,
        });
      } else {
        return res.status(400).json({
          status: resposne.successFalse,
          message: resposne.eventUpdateFail,
        });
      }
    } else {
      return res.status(200).json({
        status: resposne.successTrue,
        message: resposne.updateventSuccess,
      });
    }
  } catch (error) {
    return res.status(400).json({
      status: resposne.successFalse,
      message: error.message,
    });
  }
};

export const MyEventget = async (req, res) => {
  const role = req.user.role;

  if (role !== "admin") {
    return res.status(400).json({
      status: resposne.successFalse,
      message: resposne.unauth,
    });
  }

  const { eventId } = req.params;

  if (!eventId) {
    return res.status(400).json({
      status: resposne.successFalse,
      message: resposne.eventIdRequired,
    });
  }

  try {
    const result = await getEventById(eventId);

    if (!result) {
      res.status(400).json({
        status: resposne.successFalse,
        message: resposne.nodatavail,
      });
    } else {
      res.status(200).json({
        status: resposne.successTrue,
        message: resposne.fetchSuccess,
        data: result,
      });
    }
  } catch (error) {
    res.status(400).json({
      status: resposne.successFalse,
      message: error.message,
    });
  }
};

export const eventupdateSocial = async (req, res) => {
  const role = req.user.role;

  if (role !== "admin") {
    return res.status(400).json({
      status: resposne.successFalse,
      message: resposne.unauth,
    });
  }

  const eventId = parseInt(req.body.eventId, 10);
  const event_description = req.body.event_description;
  const closing_messsage = req.body.closing_messsage;
  const jury_welcm_messsage = req.body.jury_welcm_messsage;
  const is_social = req.body.is_social
    ? parseInt(req.body.is_social, 10)
    : undefined;
  const social = req.body.social;

  const { event_logo, event_banner, social_image } = req.files || {};

  const updates = {
    event_description,
    closing_messsage,
    jury_welcm_messsage,
    is_social,
    social,
  };

  if (event_logo) updates.imageFilename = event_logo[0].filename;
  if (event_banner) updates.event_banner = event_banner[0].filename;
  if (social_image) updates.social_image = social_image[0].filename;

  if (Object.keys(updates).length === 0) {
    return res.status(400).json({
      status: resposne.successFalse,
      message: resposne.noupdate,
    });
  }

  try {
    const result = await updateEventSocial(updates, eventId);

    if (!result) {
      return res.status(400).json({
        status: resposne.successFalse,
        message: resposne.updateFail,
      });
    }

    return res.status(200).json({
      status: resposne.successTrue,
      message: resposne.updateventSuccess,
    });
  } catch (error) {
    return res.status(400).json({
      status: resposne.successFalse,
      message: error.message,
    });
  }
};

export const SubmissionFormatCreate = async (req, res) => {
  const { role } = req.user;

  if (role !== "admin") {
    return res.status(400).json({
      status: resposne.successFalse,
      message: resposne.unauth,
    });
  }

  const { eventId, caseValue, digits, start_from, increment, prefix } =
    req.body;

  const eventIdCheck = await checkeventId(eventId);

  if (!eventIdCheck) {
    return res.status(400).json({
      status: resposne.successFalse,
      message: resposne.eventIdfail,
    });
  }

  try {
    const result = await addSubmissionId(
      eventId,
      caseValue,
      digits,
      start_from,
      increment,
      prefix,
    );

    if (result.affectedRows === 0) {
      return res.status(400).json({
        status: resposne.successFalse,
        message: resposne.submissionFormatFail,
      });
    }

    return res.status(200).json({
      status: resposne.successTrue,
      message: resposne.submissionFormatSuccess,
    });
  } catch (error) {
    return res.status(400).json({
      status: resposne.successFalse,
      message: error.message,
    });
  }
};

export const visiblePublicly = async (req, res) => {
  const { role } = req.user;

  if (role !== "admin") {
    return res.status(400).json({
      status: resposne.successFalse,
      message: resposne.unauth,
    });
  }

  const { eventId, is_publicly_visble } = req.body;

  const eventIdCheck = await checkeventId(eventId);

  if (!eventIdCheck) {
    return res.status(400).json({
      status: resposne.successFalse,
      message: resposne.eventIdfail,
    });
  }

  if (is_publicly_visble === 1) {
    const isAlreadyVisible = await checkifAlreadyVisible(eventId);

    if (isAlreadyVisible) {
      return res.status(400).json({
        status: resposne.successFalse,
        message: resposne.checkvisible,
      });
    }
  }
  try {
    const result = await publiclyVisible(eventId, is_publicly_visble);

    if (result.affectedRows === 0) {
      return res.status(400).json({
        status: resposne.successFalse,
        message: resposne.publicVisibleFalse,
      });
    }
    const successMessage =
      is_publicly_visble === 1
        ? resposne.publicVisibleTrue
        : resposne.visiblezero;

    return res.status(200).json({
      status: resposne.successTrue,
      message: successMessage,
    });
  } catch (error) {
    return res.status(400).json({
      status: resposne.successFalse,
      message: error.message,
    });
  }
};

// export const CreateGeneralSettings = async (req, res) => {
//   const { role } = req.user;

//   if (role !== "admin") {
//     return res.status(400).json({
//       status: resposne.successFalse,
//       message: resposne.unauth,
//     });
//   }

//   const {
//     eventId,
//     start_date,
//     start_time,
//     end_date,
//     end_time,
//     is_active = 0,
//     is_one_at_a_time = 0,
//     is_individual_category_assigned = 0,
//     is_Completed_Submission = 0,
//     is_jury_print_send_all = 0,
//     is_scoring_dropdown = 0,
//     is_comments_box_judging = 0,
//     is_data_single_page = 0,
//     is_total = 0,
//     is_jury_others_score = 0,
//     is_abstain = 0,
//     overall_score = null,
//   } = req.body;

//   const eventIdCheck = await checkeventId(eventId);
//   if (!eventIdCheck) {
//     return res.status(400).json({
//       status: resposne.successFalse,
//       message: resposne.eventIdfail,
//     });
//   }

//   try {
//     const eventResult = await generalSettings(
//       eventId,
//       start_date,
//       start_time,
//       end_date,
//       end_time,
//       is_active,
//       is_one_at_a_time,
//       is_individual_category_assigned,
//       is_Completed_Submission,
//       is_jury_print_send_all,
//       is_scoring_dropdown,
//       is_comments_box_judging,
//       is_data_single_page,
//       is_total,
//       is_jury_others_score,
//       is_abstain,
//       overall_score
//     );

//     if (eventResult.affectedRows > 0) {
//       return res.status(200).json({
//         status: resposne.successTrue,
//         message: resposne.generalSettingsSuccess,
//         roundId: eventResult.id,
//       });
//     } else {
//       return res.status(400).json({
//         status: resposne.successFalse,
//         message: resposne.generalsettingsError,
//       });
//     }
//   } catch (error) {
//     return res.status(400).json({
//       status: resposne.successFalse,
//       message: error.message,
//     });
//   }
// };

export const CreateGeneralSettings = async (req, res) => {
  const { role } = req.user;

  if (role !== "admin") {
    return res.status(400).json({
      status: resposne.successFalse,
      message: resposne.unauth,
    });
  }

  const {
    eventId,
    start_date,
    start_time,
    end_date,
    end_time,
    is_active = 0,
    is_one_at_a_time = 0,
    is_individual_category_assigned = 0,
    is_Completed_Submission = 0,
    is_jury_print_send_all = 0,
    is_scoring_dropdown = 0,
    is_comments_box_judging = 0,
    is_data_single_page = 0,
    is_total = 0,
    is_jury_others_score = 0,
    is_abstain = 0,
    overall_score = null,
    round_name,
  } = req.body;

  const eventIdCheck = await checkeventId(eventId);
  if (!eventIdCheck) {
    return res.status(400).json({
      status: resposne.successFalse,
      message: resposne.eventIdfail,
    });
  }

  try {
    const eventResult = await generalSettings(
      eventId,
      start_date,
      start_time,
      end_date,
      end_time,
      is_active,
      is_one_at_a_time,
      is_individual_category_assigned,
      is_Completed_Submission,
      is_jury_print_send_all,
      is_scoring_dropdown,
      is_comments_box_judging,
      is_data_single_page,
      is_total,
      is_jury_others_score,
      is_abstain,
      overall_score,
      round_name,
    );

    if (eventResult.affectedRows > 0) {
      return res.status(200).json({
        status: resposne.successTrue,
        message: resposne.generalSettingsSuccess,
        roundId: eventResult.id,
      });
    } else {
      return res.status(400).json({
        status: resposne.successFalse,
        message: resposne.generalsettingsError,
      });
    }
  } catch (error) {
    return res.status(400).json({
      status: resposne.successFalse,
      message: error.message,
    });
  }
};

export const generalSettingsget = async (req, res) => {
  const role = req.user.role;

  if (role !== "admin") {
    return res.status(400).json({
      status: resposne.successFalse,
      message: resposne.unauth,
    });
  }

  const { eventId } = req.query;

  const eventIdCheck = await checkeventIdSettings(eventId);

  if (!eventIdCheck) {
    return res.status(400).json({
      status: resposne.successFalse,
      message: resposne.eventIdfail,
    });
  }

  try {
    const result = await getgeneralSettings(eventId);
    if (result.length === 0) {
      res.status(400).json({
        status: resposne.successFalse,
        message: resposne.nodatavail,
      });
    } else {
      res.status(200).json({
        status: resposne.successTrue,
        message: resposne.fetchSuccess,
        data: result,
      });
    }
  } catch (error) {
    res.status(400).json({
      status: resposne.successFalse,
      message: error.message,
    });
  }
};

export const generalSettingsUpdate = async (req, res) => {
  const role = req.user.role;

  if (role !== "admin") {
    return res.status(400).json({
      status: resposne.successFalse,
      message: resposne.unauth,
    });
  }

  const { roundId, ...updates } = req.body;

  const roundIdCheck = await checkroundId(roundId);
  if (!roundIdCheck) {
    return res.status(400).json({
      status: resposne.successFalse,
      message: resposne.eventIdfail,
    });
  }

  if (Object.keys(updates).length === 0) {
    return res.status(400).json({
      status: resposne.successFalse,
      message: resposne.noupdate,
    });
  }

  try {
    const result = await updateGeneralSettings(updates, roundId);

    return res.status(200).json({
      status: resposne.successTrue,
      message: result.message,
    });
  } catch (error) {
    return res.status(400).json({
      status: resposne.successFalse,
      message: error.message,
    });
  }
};

export const EventStatus = async (req, res) => {
  const { role } = req.user;

  if (role !== "admin") {
    return res.status(400).json({
      status: resposne.successFalse,
      message: resposne.unauth,
    });
  }

  const { eventId, is_live, is_draft, is_archive } = req.body;

  const eventIdCheck = await checkeventId(eventId);

  if (!eventIdCheck) {
    return res.status(400).json({
      status: resposne.successFalse,
      message: resposne.eventIdfail,
    });
  }
  const updates = {
    is_live: is_live !== undefined ? is_live : 0,
    is_draft: is_draft !== undefined ? is_draft : 0,
    is_archive: is_archive !== undefined ? is_archive : 0,
  };

  if (
    updates.is_live === 0 &&
    updates.is_draft === 0 &&
    updates.is_archive === 0
  ) {
    return res.status(400).json({
      status: resposne.successFalse,
      message: resposne.noFieldsToUpdate,
    });
  }
  try {
    const result = await statusEvent(eventId, updates);

    if (result.affectedRows === 0) {
      return res.status(400).json({
        status: resposne.successFalse,
        message: resposne.draftTOArchiveFail,
      });
    }

    return res.status(200).json({
      status: resposne.successTrue,
      message: resposne.EventArchiveSuccess,
    });
  } catch (error) {
    return res.status(400).json({
      status: resposne.successFalse,
      message: error.message,
    });
  }
};

export const AssignJuryCreate = async (req, res) => {
  const { role } = req.user;

  if (role !== "admin") {
    return res.status(400).json({
      status: resposne.successFalse,
      message: resposne.unauth,
    });
  }

  const {
    eventId,
    roundId,
    group_name,
    email,
    first_name,
    last_name,
    is_readonly,
    is_auto_signin,
    is_assign_New,
    is_assign_close,
    is_assign_send,
    is_locked,
    round_name,
  } = req.body;

  const alpharoundid = roundId;
  const eventIdCheck = await checkeventId(eventId);
  if (!eventIdCheck) {
    return res.status(400).json({
      status: resposne.successFalse,
      message: resposne.eventIdfail,
    });
  }

  const roundIdCheck = await checkroundId(roundId);
  if (!roundIdCheck) {
    return res.status(400).json({
      status: resposne.successFalse,
      message: resposne.invalidroundId,
    });
  }
  const mailCheck = await checkjuryMail(eventId, roundId, email);
  if (mailCheck) {
    return res.status(400).json({
      status: resposne.successFalse,
      message: resposne.juryMailFail,
    });
  }

  try {
    const result = await AssignJury(
      eventId,
      roundId,
      email,
      first_name,
      last_name,
      is_readonly,
      is_auto_signin,
      is_assign_New,
      is_assign_close,
      is_assign_send,
      is_locked,
      round_name,
    );

    if (!result || !result.juryAssignId) {
      return res.status(400).json({
        status: resposne.successFalse,
        message: resposne.assignJuryCreateFail,
      });
    }

    if (result.affectedRows > 0) {
      const juryAssignId = result.juryAssignId;

      const addGroupName = await groupNameCreate(
        juryAssignId,
        eventId,
        roundId,
        group_name,
      );

      if (addGroupName && addGroupName.length > 0) {
        if (is_assign_send) {
          const round_no = round_name;
          const eventDetails = await getEventRoundData(eventId, roundId);

          if (eventDetails && eventDetails.length > 0) {
            const {
              event_name,
              event_logo,
              event_banner,
              end_date,
              end_time,
              organizer_first_name,
              organizer_last_name,
              industry_type,
            } = eventDetails[0];
            const formattedEndDate = new Date(end_date).toLocaleDateString();

            const emailResult = await sendGmailAssignJudge(
              first_name,
              last_name,
              email,
              event_name,
              event_logo,
              event_banner,
              round_no,
              formattedEndDate,
              end_time,
              organizer_first_name,
              organizer_last_name,
              eventId,
              roundId,
            );

            if (emailResult) {
              return res.status(400).json({
                status: resposne.successFalse,
                message: "failed to send the email",
              });
            } else {
              return res.status(200).json({
                status: resposne.successTrue,
                message: resposne.juryAssignwithemail,
                emailMessage: emailResult,
              });
            }
          } else {
            return res.status(400).json({
              status: resposne.successFalse,
              message:
                "Event details not found for the specified event and round",
            });
          }
        }

        return res.status(200).json({
          status: resposne.successTrue,
          message: resposne.assignJuryCreateSuccess,
          juryAssignId: juryAssignId,
        });
      } else {
        return res.status(400).json({
          status: resposne.successFalse,
          message: "Failed to insert group names",
        });
      }
    }
  } catch (error) {
    return res.status(400).json({
      status: resposne.successFalse,
      message: error.message,
    });
  }
};

export const getAssignJuryById = async (req, res) => {
  const { juryAssignId, eventId, roundId } = req.query;

  const juryAssignIdCheck = await checkJuryAssignId(juryAssignId);
  if (!juryAssignIdCheck) {
    return res.status(400).json({
      status: resposne.successFalse,
      message: resposne.invalidJuryAssignId,
    });
  }

  const eventIdCheck = await checkeventIdAssign(eventId);
  if (!eventIdCheck) {
    return res.status(400).json({
      status: resposne.successFalse,
      message: resposne.eventIdfail,
    });
  }

  const roundIdCheck = await checkroundIdAssignJury(roundId);
  if (!roundIdCheck) {
    return res.status(400).json({
      status: resposne.successFalse,
      message: resposne.invalidroundId,
    });
  }

  try {
    const result = await getAssignedJury(juryAssignId, eventId, roundId);

    if (result.length === 0) {
      return res.status(400).json({
        status: resposne.successFalse,
        message: "No jury assignments found for this event and round.",
      });
    }

    return res.status(200).json({
      status: resposne.successTrue,
      message: resposne.fetchSuccess,
      data: result,
    });
  } catch (error) {
    return res.status(400).json({
      status: resposne.successFalse,
      message: error.message,
    });
  }
};

const getUpdateAssignJury = ({
  email,
  first_name,
  last_name,
  is_readonly,
  is_auto_signin,
  is_assign_New,
  is_assign_close,
  is_assign_send,
  is_restricted,
  is_locked,
}) => {
  const updates = {};

  if (email) updates.email = email;
  if (first_name) updates.first_name = first_name;
  if (last_name) updates.last_name = last_name;
  if (is_readonly) updates.is_readonly = is_readonly;
  if (is_auto_signin) updates.is_auto_signin = is_auto_signin;
  if (is_assign_New) updates.is_assign_New = is_assign_New;
  if (is_assign_close) updates.is_assign_close = is_assign_close;
  if (is_assign_send) updates.is_assign_send = is_assign_send;
  if (is_restricted) updates.is_restricted = is_restricted;
  if (is_locked) updates.is_locked = is_locked;
  return updates;
};

export const juryAssignUpdate = async (req, res) => {
  const {
    juryAssignId,
    eventId,
    roundId,
    email,
    first_name,
    last_name,
    is_readonly,
    is_auto_signin,
    is_assign_New,
    is_assign_close,
    is_assign_send,
    is_restricted,
    is_locked,
    group_name,
  } = req.body;
  const juryAssignIdCheck = await checkJuryAssignId(juryAssignId);
  if (!juryAssignIdCheck) {
    return res.status(400).json({
      status: resposne.successFalse,
      message: resposne.invalidJuryAssignId,
    });
  }

  const eventIdCheck = await checkeventIdAssign(eventId);
  if (!eventIdCheck) {
    return res.status(400).json({
      status: resposne.successFalse,
      message: resposne.eventIdfail,
    });
  }

  const roundIdCheck = await checkroundIdAssignJury(roundId);
  if (!roundIdCheck) {
    return res.status(400).json({
      status: resposne.successFalse,
      message: resposne.invalidroundId,
    });
  }

  const updates = getUpdateAssignJury({
    email,
    first_name,
    last_name,
    is_readonly,
    is_auto_signin,
    is_assign_New,
    is_assign_close,
    is_assign_send,
    is_restricted,
    is_locked,
    eventId,
    roundId,
  });

  if (Object.keys(updates).length === 0 && !group_name?.length) {
    return res.status(400).json({
      status: resposne.successFalse,
      message: resposne.novalidfield,
    });
  }

  try {
    const eventExists = await checkeventId(eventId);
    if (!eventExists) {
      return res.status(400).json({
        status: resposne.successFalse,
        message: resposne.eventnotfound,
      });
    }

    if (group_name?.length) {
      const insertEmailResult = await updatedgroupName(
        juryAssignId,
        eventId,
        roundId,
        group_name,
      );
      if (insertEmailResult <= 0) {
        return res.status(400).json({
          status: resposne.successFalse,
          message: resposne.errCreateJuryGrp,
        });
      }
    }

    if (Object.keys(updates).length > 0) {
      const result = await updateAssignjury(
        updates,
        juryAssignId,
        eventId,
        roundId,
      );
      if (result.affectedRows > 0) {
        return res.status(200).json({
          status: resposne.successTrue,
          message: resposne.assignUpdateSuccess,
        });
      } else {
        return res.status(400).json({
          status: resposne.successFalse,
          message: resposne.assignUpdateFail,
        });
      }
    } else {
      return res.status(200).json({
        status: resposne.successTrue,
        message: resposne.assignUpdateSuccess,
      });
    }
  } catch (error) {
    return res.status(400).json({
      status: resposne.successFalse,
      message: error.message,
    });
  }
};

export const juryAssignGet = async (req, res) => {
  const role = req.user.role;

  if (role !== "admin") {
    return res.status(400).json({
      status: resposne.successFalse,
      message: resposne.unauth,
    });
  }

  const { eventId, roundId } = req.query;

  const eventIdCheck = await checkeventIdJuryAssign(eventId);
  if (!eventIdCheck) {
    return res.status(400).json({
      status: resposne.successFalse,
      message: resposne.eventIdfail,
    });
  }

  const roundIdCheck = await checkroundIdJuryAssign(roundId);
  if (!roundIdCheck) {
    return res.status(400).json({
      status: resposne.successFalse,
      message: resposne.invalidroundId,
    });
  }

  try {
    const result = await getAssignJury(eventId, roundId);

    if (Object.keys(result).length > 0) {
      return res.status(200).json({
        status: resposne.successTrue,
        message: resposne.fetchSuccess,
        data: result,
      });
    } else {
      return res.status(400).json({
        status: resposne.successFalse,
        message: resposne.nodatavail,
      });
    }
  } catch (error) {
    return res.status(400).json({
      status: resposne.successFalse,
      message: error.message,
    });
  }
};

export const deletejuryAssign = async (req, res) => {
  const { role } = req.user;

  if (role !== "admin") {
    return res.status(400).json({
      status: resposne.successFalse,
      message: resposne.unauth,
    });
  }

  const { juryAssignId } = req.query;
  const juryAssignIdCheck = await checkJuryAssignidGroup(juryAssignId);
  if (!juryAssignIdCheck) {
    return res.status(400).json({
      status: resposne.successFalse,
      message: resposne.invalidJuryAssignId,
    });
  }
  try {
    await softDeleteJuryAssignGrps(juryAssignId);

    const message = await softDeleteJuryAssign(juryAssignId);
    if (message.affectedRows > 0) {
      return res.status(200).json({
        status: resposne.successTrue,
        message: resposne.juryDeleteSuccess,
      });
    } else {
      return res.status(400).json({
        status: resposne.successFalse,
        message: resposne.juryDeletefail,
      });
    }
  } catch (error) {
    return res.status(400).json({
      status: resposne.successFalse,
      message: error.message,
    });
  }
};

export const AdminProfileget = async (req, res) => {
  const role = req.user.role;
  const adminId = req.user.id;
  if (role !== "admin") {
    return res.status(400).json({
      status: resposne.successFalse,
      message: resposne.unauth,
    });
  }

  try {
    const result = await getAdminProfile(adminId);

    if (result.admins.length === 0) {
      return res.status(400).json({
        status: resposne.successFalse,
        message: resposne.nodatavail,
      });
    } else {
      return res.status(200).json({
        status: resposne.successTrue,
        message: resposne.fetchSuccess,
        data: result.admins,
      });
    }
  } catch (error) {
    return res.status(400).json({
      status: resposne.successFalse,
      message: error.message,
    });
  }
};

export const CreateCoupon = async (req, res) => {
  const { role } = req.user;

  if (role !== "admin") {
    return res.status(400).json({
      status: resposne.successFalse,
      message: resposne.unauth,
    });
  }

  const {
    eventId,
    category,
    coupon_name,
    coupon_code,
    percent_off,
    coupon_amount,
    start_date,
    end_date,
  } = req.body;

  if ((percent_off && coupon_amount) || (!percent_off && !coupon_amount)) {
    return res.status(400).json({
      status: resposne.successFalse,
      message:
        "Either percent_off or coupon_amount must be provided, but not both.",
    });
  }
  const eventIdCheck = await checkeventId(eventId);
  if (!eventIdCheck) {
    return res.status(400).json({
      status: resposne.successFalse,
      message: resposne.eventIdfail,
    });
  }

  try {
    const result = await createCoupon(
      eventId,
      category,
      coupon_name,
      coupon_code,
      percent_off,
      coupon_amount,
      start_date,
      end_date,
    );

    if (result.length === 0) {
      return res.status(400).json({
        status: resposne.successFalse,
        message: resposne.couponCreatefail,
      });
    } else {
      return res.status(200).json({
        status: resposne.successTrue,
        message: resposne.couponCreateSuccess,
      });
    }
  } catch (error) {
    return res.status(400).json({
      status: resposne.successFalse,
      message: error.message,
    });
  }
};

export const AwardByIdget = async (req, res) => {
  const role = req.user.role;

  if (role !== "admin") {
    return res.status(400).json({
      status: resposne.successFalse,
      message: resposne.unauth,
    });
  }

  const { awardId } = req.params;

  const isDeleted = await checkifDeleted(awardId);

  if (isDeleted) {
    return res.status(400).json({
      status: resposne.successFalse,
      message: resposne.awardDeleted,
    });
  }

  const awardIdCheck = await checkAwardId(awardId);
  if (!awardIdCheck) {
    return res.status(400).json({
      status: resposne.successFalse,
      message: resposne.AwardIdRequired,
    });
  }

  try {
    const result = await getAwardById(awardId);

    if (!result) {
      res.status(400).json({
        status: resposne.successFalse,
        message: resposne.nodatavail,
      });
    } else {
      res.status(200).json({
        status: resposne.successTrue,
        message: resposne.fetchSuccess,
        data: result,
      });
    }
  } catch (error) {
    res.status(400).json({
      status: resposne.successFalse,
      message: error.message,
    });
  }
};

export const SearchEvent = async (req, res) => {
  try {
    const { search } = req.query;
    const result = await searchEvent(search);
    if (result.length > 0) {
      res.status(200).json({
        status: resposne.successTrue,
        message: resposne.fetchSuccess,
        data: result,
      });
    } else {
      res.status(400).json({
        status: resposne.successFalse,
        message: resposne.nodatavail,
      });
    }
  } catch (error) {
    res.status(400).json({
      status: resposne.successFalse,
      message: error.message,
    });
  }
};

//----------------------------------- Dynamic form create ---- start ----------------------------------//

//  Registration Form
export const createRegistrationForm = async (req, res) => {
  const role = req.user.role;

  if (role !== "admin") {
    return res.status(400).json({
      status: resposne.successFalse,
      message: resposne.unauth,
    });
  }
  const { eventId, form_schema } = req.body;

  const eventIdCheck = await checkeventId(eventId);
  if (!eventIdCheck) {
    return res.status(400).json({
      status: resposne.successFalse,
      message: resposne.eventIdfail,
    });
  }
  const UserWitheventIdCheck = await checkeventId(eventId);
  if (!eventIdCheck) {
    return res.status(400).json({
      status: resposne.successFalse,
      message: resposne.eventIdfail,
    });
  }
  const formExists = await checkFormExists(eventId);
  if (formExists) {
    return res.status(400).json({
      status: resposne.successFalse,
      message: resposne.formAlreadyExists,
    });
  }

  try {
    const result = await createRegistrationFormService(eventId, form_schema);

    if (result.affectedRows > 0) {
      return res.status(200).json({
        status: resposne.successTrue,
        message: resposne.regFormTrue,
        is_filled: 0,
        registrationFormId: result.insertId,
        result: form_schema,
      });
    }
  } catch (error) {
    return res.status(400).json({
      status: resposne.successFalse,
      message: error.message,
    });
  }
};

export const getRegistrationFormByEventId = async (req, res) => {
  const role = req.user.role;
  const createdby = req.user.id;
  if (role !== "admin" && role !== "user") {
    return res.status(400).json({
      status: resposne.successFalse,
      message: resposne.unauth,
    });
  }
  const { registrationFormId, eventId } = req.query;

  const checkEventRegistration1 = await checkEventRegistration(
    eventId,
    createdby,
  );
  if (checkEventRegistration1) {
    return res.status(200).json({
      status: resposne.successTrue,
      message: "Register Already for this event ",
    });
  }
  const eventIdCheck = await checkeventId(eventId);
  if (!eventIdCheck) {
    return res.status(400).json({
      status: resposne.successFalse,
      message: resposne.eventIdfail,
    });
  }

  const RegFormIdCheck = await checkRegFormId(registrationFormId);
  if (!RegFormIdCheck) {
    return res.status(400).json({
      status: resposne.successFalse,
      message: resposne.regFormIdfail,
    });
  }

  try {
    const result = await getRegistrationFormService(
      eventId,
      registrationFormId,
    );

    if (result.length === 0) {
      return res.status(400).json({
        status: resposne.successFalse,
        message: resposne.noregIdEventId,
      });
    }

    return res.status(200).json({
      status: resposne.successFalse,
      message: resposne.regFormFetch,
      data: result[0],
    });
  } catch (error) {
    return res.status(400).json({
      status: resposne.successFalse,
      message: error.message,
    });
  }
};

export const updateRegistrationForm = async (req, res) => {
  const role = req.user.role;

  if (role !== "admin") {
    return res.status(400).json({
      status: resposne.successFalse,
      message: resposne.unauth,
    });
  }
  const { eventId, registrationFormId, form_schema } = req.body;

  const eventIdCheck = await checkeventId(eventId);
  if (!eventIdCheck) {
    return res.status(400).json({
      status: resposne.successFalse,
      message: resposne.eventIdfail,
    });
  }
  const RegFormIdCheck = await checkRegFormId(registrationFormId);
  if (!RegFormIdCheck) {
    return res.status(400).json({
      status: resposne.successFalse,
      message: resposne.regFormIdfail,
    });
  }

  try {
    const result = await updateRegistrationFormService(
      eventId,
      registrationFormId,
      form_schema,
    );
    if (result.affectedRows === 0) {
      return res.status(400).json({
        status: resposne.successFalse,
        message: resposne.noformFound,
      });
    }
    return res.status(200).json({
      status: resposne.successTrue,
      updatedId: registrationFormId,
      message: resposne.regUpdateSucess,
    });
  } catch (error) {
    return res.status(400).json({
      status: resposne.successFalse,
      message: error.message,
    });
  }
};

// Entry Form

export const createEntryForm = async (req, res) => {
  const role = req.user.role;

  if (role !== "admin") {
    return res.status(400).json({
      status: resposne.successFalse,
      message: resposne.unauth,
    });
  }

  const { eventId, form_schema } = req.body;
  const eventIdCheck = await checkeventId(eventId);
  if (!eventIdCheck) {
    return res.status(400).json({
      status: resposne.successFalse,
      message: resposne.eventIdfail,
    });
  }
  const formExists = await checkEntryFormExists(eventId);
  if (formExists) {
    return res.status(400).json({
      status: resposne.successFalse,
      message: resposne.entryformAlreadyExists,
    });
  }
  try {
    const result = await createEntryFormService(eventId, form_schema);

    if (result.affectedRows > 0) {
      return res.status(200).json({
        status: resposne.successTrue,
        message: resposne.entryTrue,
        id: result.insertId,
        result: form_schema,
      });
    } else {
      return res.status(400).json({
        status: resposne.successFalse,
        message: resposne.entryFailed,
      });
    }
  } catch (error) {
    return res.status(400).json({
      status: resposne.successFalse,
      message: error.message,
    });
  }
};

export const getEntryFormByEventId = async (req, res) => {
  const role = req.user.role;

  // if (role !== "admin" && role !== "user") {
  //   return res.status(400).json({
  //     status: resposne.successFalse,
  //     message: resposne.unauth,
  //   });
  // }

  const { eventId, entryFormId } = req.query;

  const eventIdCheck = await checkeventId(eventId);
  if (!eventIdCheck) {
    return res.status(400).json({
      status: resposne.successFalse,
      message: resposne.eventIdfail,
    });
  }
  const entryFormIdCheck = await checkentryFormId(entryFormId);
  if (!entryFormIdCheck) {
    return res.status(400).json({
      status: resposne.successFalse,
      message: resposne.entryFormIdfail,
    });
  }
  try {
    const result = await getEntryFormService(eventId, entryFormId);

    if (result.length === 0) {
      return res.status(400).json({
        status: resposne.successFalse,
        message: resposne.noentryIdEventId,
      });
    }

    return res.status(200).json({
      status: resposne.successTrue,
      message: resposne.entryFormFetch,
      data: result[0],
    });
  } catch (error) {
    return res.status(400).json({
      status: resposne.successFalse,
      message: error.message,
    });
  }
};

export const updateEntryForm = async (req, res) => {
  const role = req.user.role;

  if (role !== "admin") {
    return res.status(400).json({
      status: resposne.successFalse,
      message: resposne.unauth,
    });
  }

  const { eventId, entryFormId, form_schema } = req.body;

  const eventIdCheck = await checkeventId(eventId);
  if (!eventIdCheck) {
    return res.status(400).json({
      status: resposne.successFalse,
      message: resposne.eventIdfail,
    });
  }

  const entryFormIdCheck = await checkentryFormId(entryFormId);
  if (!entryFormIdCheck) {
    return res.status(400).json({
      status: resposne.successFalse,
      message: resposne.entryFormIdfail,
    });
  }

  try {
    const result = await updateEntryFormService(
      eventId,
      entryFormId,
      form_schema,
    );

    if (result.affectedRows === 0) {
      return res.status(400).json({
        status: resposne.successFalse,
        message: resposne.noformFound,
      });
    }

    return res.status(200).json({
      status: resposne.successTrue,
      updatedId: entryFormId,
      message: resposne.entrySuccess,
    });
  } catch (error) {
    return res.status(400).json({
      status: resposne.successFalse,
      message: error.message,
    });
  }
};

//----------------------------------- Dynamic form create ---- End ----------------------------------//

export const Roudget = async (req, res) => {
  const role = req.user.role;
  if (role !== "admin") {
    return res.status(400).json({
      status: resposne.successFalse,
      message: resposne.unauth,
    });
  }
  const { roundId } = req.query;
  const roundIdCheck = await checkroundId(roundId);
  if (!roundIdCheck) {
    return res.status(400).json({
      status: resposne.successFalse,
      message: resposne.invalidroundId,
    });
  }
  try {
    const result = await getRoundById(roundId);
    if (result.length === 0) {
      res.status(400).json({
        status: resposne.successFalse,
        message: resposne.nodatavail,
      });
    } else {
      res.status(200).json({
        status: resposne.successTrue,
        message: resposne.fetchSuccess,
        data: result[0],
      });
    }
  } catch (error) {
    res.status(400).json({
      status: resposne.successFalse,
      message: error.message,
    });
  }
};

export const createScoreForm = async (req, res) => {
  const {
    eventId,
    roundId,
    form_schema,
    overall_value,
    scorecard_categories,
    categoryId,
  } = req.body;

  const eventIdCheck = await checkeventId(eventId);
  if (!eventIdCheck) {
    return res.status(400).json({
      status: resposne.successFalse,
      message: resposne.eventIdfail,
    });
  }
  const roundIdCheck = await checkroundId(roundId);
  if (!roundIdCheck) {
    return res.status(400).json({
      status: resposne.successFalse,
      message: resposne.invalidroundId,
    });
  }

  try {
    const result = await createScorecaRD(
      eventId,
      roundId,
      form_schema,
      overall_value,
      categoryId,
    );

    if (result.affectedRows > 0) {
      const scoreFormId = result.insertId;

      const scoreFormIdCheck = await checkScorecardFormId(scoreFormId);
      if (!scoreFormIdCheck) {
        return res.status(400).json({
          status: resposne.successFalse,
          message: resposne.invalidScoreFormId,
        });
      }
      const addCategory = await roundAwardCategory(
        eventId,
        roundId,
        scoreFormId,
        scorecard_categories,
      );

      if (addCategory && addCategory.length > 0) {
        return res.status(200).json({
          status: resposne.successTrue,
          message: resposne.scorecardwithCategory,
          data: {
            scoreFormId: result.insertId,
            scorecard_categories: addCategory,
          },
        });
      } else {
        return res.status(400).json({
          status: resposne.successFalse,
          message: resposne.scorecardwithCategoryfail,
        });
      }
    } else {
      return res.status(400).json({
        status: resposne.successFalse,
        message: resposne.ScoreCardFail,
      });
    }
  } catch (error) {
    return res.status(400).json({
      status: resposne.successFalse,
      message: error.message,
    });
  }
};

export const createScoreForm1 = async (req, res) => {
  const {
    eventId,
    roundId,
    form_schema,
    overall_value,
    scorecard_categories,
    categoryId, // now expected as array
  } = req.body;

  try {
    // Validate Event ID
    const eventIdCheck = await checkeventId(eventId);
    if (!eventIdCheck) {
      return res.status(400).json({
        status: resposne.successFalse,
        message: resposne.eventIdfail,
      });
    }

    // Validate Round ID
    const roundIdCheck = await checkroundId(roundId);
    if (!roundIdCheck) {
      return res.status(400).json({
        status: resposne.successFalse,
        message: resposne.invalidroundId,
      });
    }

    const result = await createScorecaRD1(
      eventId,
      roundId,
      form_schema,
      overall_value,
      categoryId,
    );

    if (!result || result.length === 0) {
      return res.status(400).json({
        status: resposne.successFalse,
        message: resposne.ScoreCardFail,
      });
    }

    // Use the first scorecard ID to associate the categories (can be adjusted to loop if needed)
    const scoreFormIdArray = result;
    console.log("firstScoreFormId", result);
    // const scoreFormIdCheck = await checkScorecardFormId(firstScoreFormId);
    // if (!scoreFormIdCheck) {
    //   return res.status(400).json({
    //     status: resposne.successFalse,
    //     message: resposne.invalidScoreFormId,
    //   });
    // }

    // Add category mapping
    const addCategory = await roundAwardCategory(
      eventId,
      roundId,
      scoreFormIdArray,
      scorecard_categories,
    );

    if (!addCategory || addCategory.length === 0) {
      return res.status(400).json({
        status: resposne.successFalse,
        message: resposne.scorecardwithCategoryfail,
      });
    }

    // Success response
    return res.status(200).json({
      status: resposne.successTrue,
      message: resposne.scorecardwithCategory,
      data: {
        createdScorecards: result,
        scorecard_categories: addCategory,
      },
    });
  } catch (error) {
    return res.status(400).json({
      status: resposne.successFalse,
      message: error.message,
    });
  }
};

export const getScorecardform = async (req, res) => {
  const { scoreFormId, eventId, roundId } = req.query;

  const eventIdCheck = await checkeventIdScore(eventId);
  if (!eventIdCheck) {
    return res.status(400).json({
      status: resposne.successFalse,
      message: resposne.eventIdfail,
    });
  }

  const entryFormIdCheck = await checkSCOREFormIdCategory(scoreFormId);
  if (!entryFormIdCheck) {
    return res.status(400).json({
      status: resposne.successFalse,
      message: resposne.invalidScoreFormId,
    });
  }
  const roundIdCheck = await checkroundIdScore(roundId);
  if (!roundIdCheck) {
    return res.status(400).json({
      status: resposne.successFalse,
      message: resposne.invalidroundId,
    });
  }

  try {
    const result = await getscorecardService(scoreFormId, eventId, roundId);

    if (!result || result.scorecard_categories.length === 0) {
      return res.status(400).json({
        status: resposne.successFalse,
        message: resposne.noentryIdEventId,
      });
    }

    return res.status(200).json({
      status: resposne.successTrue,
      message: resposne.entryFormFetch,
      data: result,
    });
  } catch (error) {
    return res.status(400).json({
      status: resposne.successFalse,
      message: error.message,
    });
  }
};

const getUpdateScoreform = ({ form_schema, overall_value, categoryId }) => {
  const updates = {};
  if (form_schema) updates.form_schema = form_schema;
  if (overall_value) updates.overall_value = overall_value;
  if (categoryId) updates.categoryId = categoryId;

  return updates;
};
export const updateScorecardForm = async (req, res) => {
  const {
    scoreFormId,
    eventId,
    roundId,
    form_schema,
    overall_value,
    scorecard_categories,
    categoryId,
  } = req.body;

  const updates = getUpdateScoreform({
    form_schema,
    overall_value,
    categoryId,
  });

  if (Object.keys(updates).length === 0 && !scorecard_categories?.length) {
    return res.status(400).json({
      status: resposne.successFalse,
      message: resposne.novalidfield,
    });
  }

  try {
    const { exists, categoryId: existingCategoryId } =
      await checkScorecardExistsNot(scoreFormId, eventId, roundId, categoryId);

    if (!exists) {
      if (existingCategoryId) {
        // Another category exists in this round, return an error
        return res.status(400).json({
          status: resposne.successFalse,
          message: `No scorecard found for categoryId: ${categoryId}, but found an existing scorecard for categoryId: ${existingCategoryId}`,
        });
      } else {
        // No scorecard at all in this round, proceed with full body values
        return await forceUpdateScorecard(req, res);
      }
    }

    // Proceed with update if scorecard exists
    const eventExists = await checkeventId(eventId);
    if (!eventExists) {
      return res.status(400).json({
        status: resposne.successFalse,
        message: resposne.eventnotfound,
      });
    }

    if (scorecard_categories?.length) {
      const scorecardResult = await updateScorecardcategories(
        scoreFormId,
        eventId,
        roundId,
        scorecard_categories,
      );

      if (scorecardResult <= 0) {
        return res.status(400).json({
          status: resposne.successFalse,
          message: resposne.scrcardCatgryFail,
        });
      }
    }

    if (Object.keys(updates).length > 0) {
      const result = await updateScorecardService(
        updates,
        scoreFormId,
        eventId,
        roundId,
      );

      if (result.affectedRows > 0) {
        return res.status(200).json({
          status: resposne.successTrue,
          message: resposne.scrcrdUpdateSuccess,
        });
      } else {
        return res.status(400).json({
          status: resposne.successFalse,
          message: resposne.scrcrdUpdatefail,
        });
      }
    } else {
      return res.status(200).json({
        status: resposne.successTrue,
        message: resposne.scrcrdUpdateSuccess,
      });
    }
  } catch (error) {
    return res.status(400).json({
      status: resposne.successFalse,
      message: error.message,
    });
  }
};

export const scorecardsGet = async (req, res) => {
  const role = req.user.role;

  if (role !== "admin") {
    return res.status(400).json({
      status: resposne.successFalse,
      message: resposne.unauth,
    });
  }

  const { eventId, roundId } = req.query;

  const eventIdCheck = await checkScorecardEventId(eventId);
  if (!eventIdCheck) {
    return res.status(400).json({
      status: resposne.successFalse,
      message: resposne.eventIdfail,
    });
  }
  const roundIdCheck = await checkroundIdScore(roundId);
  if (!roundIdCheck) {
    return res.status(400).json({
      status: resposne.successFalse,
      message: resposne.invalidroundId,
    });
  }

  try {
    const result = await getScorecards(eventId, roundId);

    if (result.length > 0) {
      return res.status(200).json({
        status: resposne.successTrue,
        message: resposne.fetchSuccess,
        data: result,
      });
    } else {
      return res.status(400).json({
        status: resposne.successFalse,
        message: resposne.nodatavail,
      });
    }
  } catch (error) {
    return res.status(400).json({
      status: resposne.successFalse,
      message: error.message,
    });
  }
};

export const deleteScorecard = async (req, res) => {
  const { role } = req.user;

  if (role !== "admin") {
    return res.status(400).json({
      status: resposne.successFalse,
      message: resposne.unauth,
    });
  }

  const { scoreFormId } = req.query;

  const isDeleted = await checkIfScoreFormDeleted(scoreFormId);
  if (isDeleted) {
    return res.status(400).json({
      status: resposne.successFalse,
      message: resposne.scoreforcardalreadyDeleted,
    });
  }

  const isCategoriesDeleted =
    await checkIfScoreFormCategoriesDeleted(scoreFormId);
  if (isCategoriesDeleted) {
    return res.status(400).json({
      status: resposne.successFalse,
      message: resposne.scrcrdAlrdyDeleted,
    });
  }

  try {
    await softDeleteScorecard(scoreFormId);
    const result = await softDeleteCategiesScorecard(scoreFormId);

    if (result.affectedRows === 0) {
      return res.status(400).json({
        status: resposne.successFalse,
        message: resposne.scorecardDeleteFail,
      });
    }

    return res.status(200).json({
      status: resposne.successTrue,
      message: resposne.scorecardDeleteSuccess,
    });
  } catch (error) {
    return res.status(400).json({
      status: resposne.successFalse,
      message: error.message,
    });
  }
};

export const EventgetUser = async (req, res) => {
  const { role } = req.user;

  // Ensure the user is an admin
  if (role !== "admin") {
    return res.status(400).json({
      status: resposne.successFalse, // fixed typo
      message: resposne.unauth, // fixed typo
    });
  }

  const adminId = req.user.id;
  const { eventId } = req.query;

  // Step 1: Check if the event exists
  const eventIdCheck = await checkeventId(eventId);
  if (!eventIdCheck) {
    return res.status(400).json({
      status: resposne.successFalse, // fixed typo
      message: resposne.eventIdfail, // fixed typo
    });
  }

  // Step 2: Ensure the admin is authorized to access the event
  const adminIdCheck = await checkadminIdEvent(adminId, eventId);
  if (!adminIdCheck) {
    return res.status(400).json({
      status: resposne.successFalse, // fixed typo
      message: "Invalid admin ID or not authorized to access this event.",
    });
  }

  try {
    // Step 3: Generate the backdoor link and fetch event details
    const result = await getEventByUrlKey(eventId);

    // Step 4: Return the backdoor URL
    return res.status(200).json({
      status: resposne.successTrue, // fixed typo
      message: resposne.fetchSuccess, // fixed typo
      data: result,
    });
  } catch (error) {
    // Catch any errors from the getEventByUrlKey function
    return res.status(400).json({
      status: resposne.successFalse, // fixed typo
      message: error.message || "Unknown error",
    });
  }
};

export const Eventgetbylink = async (req, res) => {
  const { uniqueUrlKey } = req.params;

  try {
    const result = await getEventByUniqueUrlKey(uniqueUrlKey);

    if (result) {
      return res.status(200).json({
        status: resposne.successTrue,
        message: resposne.fetchSuccess,
        data: result,
      });
    } else {
      return res.status(400).json({
        status: resposne.successFalse,
        message: resposne.nodatavail,
      });
    }
  } catch (error) {
    return res.status(400).json({
      status: resposne.successFalse,
      message: error.message,
    });
  }
};

export const submitRegistrationData = async (req, res) => {
  const { eventId, registrationFormId, fields } = req.body;
  const created_by = req.user.id;
  const role = req.user.role;
  const email = req.user.email;
  if (role !== "user") {
    return res.status(400).json({
      status: resposne.successFalse,
      message: "Only users are allowed to submit registration data.",
    });
  }

  if (created_by) {
    const userExists = await checkuser(created_by);
    if (!userExists) {
      return res.status(400).json({
        status: resposne.successFalse,
        message: resposne.invalidUserId,
      });
    }
  }

  try {
    const result = await submitRegistrationDataService(
      eventId,
      registrationFormId,
      created_by,
      role,
      fields,
    );

    if (result.affectedRows > 0) {
      const event = await eventdetails(eventId);
      const emailadminget = event[0].email;
      console.log("emailadminget", emailadminget);
      if (event && event[0]) {
        await sendRegistrationAcknowledgement(
          email,
          fields,
          event[0],
          emailadminget,
        ); // ✅ FIXED ARG ORDER
      }

      return res.status(200).json({
        status: response.successTrue,
        message: response.regformDataSubSuccess,
      });
    } else {
      return res.status(400).json({
        status: response.successFalse,
        message: response.regformDataSubFail,
      });
    }
  } catch (error) {
    return res.status(400).json({
      status: resposne.successFalse,
      message: error.message,
    });
  }
};

export const sendmailMultiple = async (req, res) => {
  const { role } = req.user;

  if (role !== "admin") {
    return res.status(400).json({
      status: resposne.successFalse,
      message: resposne.unauth,
    });
  }

  const { eventId, roundId, round_name, data } = req.body;

  console.log("eventId:", eventId);
  console.log("roundId (alpharoundid):", roundId);

  try {
    const eventDetails = await getEventRoundData(eventId, roundId);

    if (!eventDetails || eventDetails.length === 0) {
      return res.status(400).json({
        status: resposne.successFalse,
        message: "Event details not found.",
      });
    }

    const {
      event_name,
      event_logo,
      event_banner,
      end_date,
      end_time,
      organizer_first_name,
      organizer_last_name,
    } = eventDetails[0];

    await Promise.all(
      data.map(({ email, first_name, last_name }) =>
        sendGmailAssignJudge(
          first_name,
          last_name,
          email,
          event_name,
          event_logo,
          event_banner,
          round_name, // round_no
          end_date, // pass raw end date
          end_time,
          organizer_first_name,
          organizer_last_name,
          eventId,
          roundId, // alpharoundid
        ),
      ),
    );

    return res.status(200).json({
      status: resposne.successTrue,
      message: "Emails sent successfully.",
    });
  } catch (error) {
    return res.status(400).json({
      status: resposne.successFalse,
      message: error.message,
    });
  }
};
export const exportAssignJury = async (req, res) => {
  const { role } = req.user;

  if (role !== "admin") {
    return res.status(400).json({
      status: resposne.successFalse,
      message: resposne.unauth,
    });
  }
  const { eventId, roundId } = req.query;

  try {
    const products = await exportJuryAssign(eventId, roundId);

    if (!products || products.length === 0) {
      return res.status(400).json({
        status: resposne.successFalse,
        message: resposne.nodataDownload,
      });
    }

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Assigned Jury");

    worksheet.columns = [
      { header: "First Name", key: "first_name", width: 20 },
      { header: "Last Name", key: "last_name", width: 20 },
      { header: "E-mail", key: "email", width: 40 },
      { header: "Assigned Groups", key: "group_names", width: 50 },
      { header: "Status", key: "is_active", width: 20 },
    ];

    const eventName = products[0].event_name;

    products.forEach((product) => {
      worksheet.addRow({
        first_name: product.first_name,
        last_name: product.last_name,
        email: product.email,
        group_names: product.group_names,
        is_active: product.is_active ? "Active" : "Inactive",
      });
    });

    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    );
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=Assigned_jury_data_${eventName}.xlsx`,
    );

    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    res.status(400).json({
      status: resposne.successFalse,
      message: resposne.downloadFail,
      error: error.message,
    });
  }
};

// last work
// export const submitEntryData = async (req, res) => {
//   const { eventId, awardcatId, entryFormId, fields } = req.body;
//   const email = req.user.email;
//   const first_name = req.user.first_name || "submitbyadmin";
//   const last_name = req.user.last_name || "submitbyadmin";
//   const eventIdCheck = await checkeventId(eventId);
//   if (!eventIdCheck) {
//     return res.status(400).json({
//       status: resposne.successFalse,
//       message: resposne.eventIdfail,
//     });
//   }

//   const awardcatCheck = await checkawardCatIdNew(awardcatId);
//   console.log("awardcatCheck", awardcatCheck);
// if (!awardcatCheck.exists) {
//   return res.status(400).json({
//     status: resposne.successFalse,
//     message: resposne.AwardIdRequired,
//   });
// }

// if (!awardcatCheck.submissionAllowed) {
//   return res.status(400).json({
//     status: resposne.successFalse,
//     message: "Category Accepted submissions at this time is over.",
//   });
// }
//   const entryFormIdCheck = await checkentryFormId(entryFormId);
//   if (!entryFormIdCheck) {
//     return res.status(400).json({
//       status: resposne.successFalse,
//       message: resposne.entryFormIdfail,
//     });
//   }
// const submissionLimit = await getSubmissionLimit(eventId, awardcatId);
// console.log("test111111111111111111111111111111111111111111111111111111111",submissionLimit)
// if (submissionLimit !== null && submissionLimit > 0) {
//   const totalSubmissions = await countSubmissions(eventId, awardcatId);
// console.log("ttttttttttttttttttttttttttttttttttt",totalSubmissions)
//   if (totalSubmissions >= submissionLimit) {
//     return res.status(400).json({
//       status: resposne.successFalse,
//       message: "Submission limit reached for this category.",
//     });
//   }
// }

//   const created_by = req.user?.id;
//   const role = req.user?.role;

//   try {
//     const submissionIdData = await awardcategoryprewfixget(eventId, awardcatId);
//     const categoryPrefix = submissionIdData.category_prefix;

//     const case_value = await fetchCaseValueFromDatabase(eventId, awardcatId);

//     let submissionId;

//     switch (case_value) {
//       case 1:
//         submissionId = await generateSubmissionValue1(eventId, categoryPrefix);
//         break;

//       case 2:
//         const lastValue = await generateSubmissionValue2(
//           eventId,
//           categoryPrefix
//         );
//         submissionId = `${categoryPrefix}-${lastValue}`;
//         break;

//       case 3:
//         const submissionIdData3 = await PredefineSubimissionIdGet(eventId);
//         const categoryPrefix3 = submissionIdData3.prefix;
//         const lastValue3 = await generateSubmissionValue3(
//           eventId,
//           categoryPrefix3
//         );
//         submissionId = categoryPrefix3
//           ? `${categoryPrefix3}-${lastValue3}`
//           : `${lastValue3}`;
//         break;

//       default:
//         const lastSubmission = await fetchLastSubmissionId(eventId, awardcatId);
//         if (lastSubmission) {
//           const lastIdParts = lastSubmission.submission_id.split("-");
//           let lastNumber = parseInt(lastIdParts[lastIdParts.length - 1], 10);

//           lastNumber++;

//           const newSubmissionId = `${categoryPrefix}-${lastNumber
//             .toString()
//             .padStart(4, "0")}`;
//           submissionId = newSubmissionId;
//         } else {
//           submissionId = `${categoryPrefix}-0001`;
//         }
//         break;
//     }

//     if (!submissionId) {
//       return res.status(400).json({
//         status: resposne.successFalse,
//         message: resposne.SubIDGenail,
//       });
//     }

//     const fieldEntries = Object.entries(fields);
//     if (fieldEntries.length === 0) {
//       return res.status(400).json({
//         status: resposne.successFalse,
//         message: resposne.noProvidedfield,
//       });
//     }

//     const insertResult = await insertEntryDataIntoDatabase(
//       eventId,
//       awardcatId,
//       submissionId,
//       entryFormId,
//       created_by,
//       role,
//       fieldEntries
//     );

//     if (insertResult.error) {
//       return res.status(400).json({
//         status: resposne.successFalse,
//         message: resposne.EntryDataSaveFail,
//         error: insertResult.error,
//       });
//     }
//     const event = await eventdetails(eventId);
//     const emailadminget = event[0]?.email;
//     const additionalEmailsRaw = await eventaddititonalemail(eventId);

//     const additionalEmails = additionalEmailsRaw
//       .filter((email) => email?.additonal_email)
//       .map((email) => email.additonal_email);

//     if (event && event[0]) {
//       await Submissiondetail(
//         first_name,
//         last_name,
//         email, // 👤 user
//         event[0],
//         [...additionalEmails, emailadminget] // pass all extra as BCC
//       );
//     }

//     return res.status(200).json({
//       status: resposne.successTrue,
//       message: resposne.EnteryDataSuccess,
//       submissionId,
//     });
//   } catch (error) {
//     return res.status(400).json({
//       status: resposne.successFalse,
//       message: error.message,
//     });
//   }
// };
export const submitEntryData = async (req, res) => {
  const { eventId, awardcatId, entryFormId, fields, isDraft } = req.body;
  const email = req.user.email;
  const first_name = req.user.first_name || "submitbyadmin";
  const last_name = req.user.last_name || "submitbyadmin";

  try {
    // Validate eventId, awardcatId, and entryFormId in parallel
    const [eventIdCheck, awardcatCheck, entryFormIdCheck] = await Promise.all([
      checkeventId(eventId),
      checkawardCatIdNew(awardcatId),
      checkentryFormId(entryFormId),
    ]);

    if (!eventIdCheck) {
      return res.status(400).json({
        status: resposne.successFalse,
        message: resposne.eventIdfail,
      });
    }

    if (!awardcatCheck.exists) {
      return res.status(400).json({
        status: resposne.successFalse,
        message: resposne.AwardIdRequired,
      });
    }

    if (!awardcatCheck.submissionAllowed) {
      return res.status(400).json({
        status: resposne.successFalse,
        message: "Category Accepted submissions at this time is over.",
      });
    }

    if (!entryFormIdCheck) {
      return res.status(400).json({
        status: resposne.successFalse,
        message: resposne.entryFormIdfail,
      });
    }

    // Check submission limit in parallel
    const [submissionLimit, totalSubmissions] = await Promise.all([
      getSubmissionLimit(eventId, awardcatId),
      countSubmissions(eventId, awardcatId),
    ]);

    if (
      submissionLimit !== null &&
      submissionLimit > 0 &&
      totalSubmissions >= submissionLimit
    ) {
      return res.status(400).json({
        status: resposne.successFalse,
        message: "Submission limit reached for this category.",
      });
    }

    const created_by = req.user?.id;
    const role = req.user?.role;

    const submissionIdData = await awardcategoryprewfixget(eventId, awardcatId);
    const categoryPrefix = submissionIdData.category_prefix;

    const case_value = await fetchCaseValueFromDatabase(eventId, awardcatId);

    let submissionId;

    switch (case_value) {
      case 1:
        submissionId = await generateSubmissionValue1(eventId, categoryPrefix);
        break;

      case 2:
        const lastValue = await generateSubmissionValue2(
          eventId,
          categoryPrefix,
        );
        submissionId = `${categoryPrefix}-${lastValue}`;
        break;

      case 3:
        const submissionIdData3 = await PredefineSubimissionIdGet(eventId);
        const categoryPrefix3 = submissionIdData3.prefix;
        const lastValue3 = await generateSubmissionValue3(
          eventId,
          categoryPrefix3,
        );
        submissionId = categoryPrefix3
          ? `${categoryPrefix3}-${lastValue3}`
          : `${lastValue3}`;
        break;

      default:
        const lastSubmission = await fetchLastSubmissionId(eventId, awardcatId);
        if (lastSubmission && lastSubmission.submission_id) {
          const lastIdParts = lastSubmission.submission_id.split("-");
          let lastNumber = parseInt(lastIdParts[lastIdParts.length - 1], 10);
          lastNumber++;
          submissionId = `${categoryPrefix}-${lastNumber.toString().padStart(4, "0")}`;
        } else {
          submissionId = `${categoryPrefix}-0001`;
        }
        break;
    }

    if (!submissionId) {
      return res.status(400).json({
        status: resposne.successFalse,
        message: resposne.SubIDGenail,
      });
    }

    const fieldEntries = Object.entries(fields);
    if (fieldEntries.length === 0) {
      return res.status(400).json({
        status: resposne.successFalse,
        message: resposne.noProvidedfield,
      });
    }

    const insertResult = await insertEntryDataIntoDatabase(
      eventId,
      awardcatId,
      submissionId,
      entryFormId,
      created_by,
      role,
      fieldEntries,
      isDraft,
    );
    console.log(submissionId, "submissionId");
    if (insertResult.error) {
      return res.status(400).json({
        status: resposne.successFalse,
        message: resposne.EntryDataSaveFail,
        error: insertResult.error,
      });
    }

    // Get event + additional emails in parallel
    const [event, additionalEmailsRaw] = await Promise.all([
      eventdetails(eventId),
      eventaddititonalemail(eventId),
    ]);

    const emailadminget = event[0]?.email;
    const additionalEmails = additionalEmailsRaw
      .filter((email) => email?.additonal_email)
      .map((email) => email.additonal_email);

    if (event && event[0]) {
      await Submissiondetail(first_name, last_name, email, event[0], [
        ...additionalEmails,
        emailadminget,
      ]);
    }

    const mediasubmissionupdate = await updateMediaSubmissionId(
      created_by,
      eventId,
      submissionId,
    );

    return res.status(200).json({
      status: resposne.successTrue,
      message: resposne.EnteryDataSuccess,
      submissionId,
      updatedMedia: mediasubmissionupdate || false, // Optional, to include update result
    });
  } catch (error) {
    return res.status(400).json({
      status: resposne.successFalse,
      message: error.message,
    });
  }
};

// export const handleShortlistData = async (req, res) => {
//   const role = req.user.role;

//   if (role !== "admin") {
//     return res.status(400).json({
//       status: resposne.successFalse,
//       message: resposne.unauth,
//     });
//   }
//   const { eventId, roundId, submission_ids, shortlist_round } = req.body;

//   try {
//     const eventIdCheck = await checkeventId(eventId);
//     if (!eventIdCheck) {
//       return res.status(400).json({
//         status: resposne.successFalse,
//         message: resposne.eventIdfail,
//       });
//     }

//     const roundIdCheck = await checkroundId(roundId);
//     if (!roundIdCheck) {
//       return res.status(400).json({
//         status: resposne.successFalse,
//         message: resposne.invalidroundId,
//       });
//     }

//     if (!Array.isArray(submission_ids) || submission_ids.length === 0) {
//       return res.status(400).json({
//         status: resposne.successFalse,
//         message: "Invalid submission_ids array.",
//       });
//     }

//     const existingSubmissionIds = await checkSubmissionId(submission_ids);
//     if (existingSubmissionIds) {
//       return res.status(400).json({
//         status: resposne.successFalse,
//         message: "already ewxists submission ",
//       });
//     }
//     const insertResults = await insertShortlistData(
//       eventId,
//       roundId,
//       submission_ids,
//       shortlist_round
//     );

//     return res.status(200).json({
//       status: resposne.successTrue,
//       message: "Shortlisted data inserted successfully.",
//       data: insertResults,
//     });
//   } catch (error) {
//     return res.status(400).json({
//       status: resposne.successFalse,
//       message: error.message,
//     });
//   }
// };

// last code test
// export const handleShortlistData = async (req, res) => {
//   const role = req.user.role;

//   if (role !== "admin") {
//     return res.status(400).json({
//       status: resposne.successFalse,
//       message: resposne.unauth,
//     });
//   }

//   const { eventId, roundId, submission_ids, shortlist_round } = req.body;

//   try {
//     const eventIdCheck = await checkeventId(eventId);
//     if (!eventIdCheck) {
//       return res.status(400).json({
//         status: resposne.successFalse,
//         message: resposne.eventIdfail,
//       });
//     }

//     const roundIdCheck = await checkroundId(roundId);
//     if (!roundIdCheck) {
//       return res.status(400).json({
//         status: resposne.successFalse,
//         message: resposne.invalidroundId,
//       });
//     }

//     if (!Array.isArray(submission_ids) || submission_ids.length === 0) {
//       return res.status(400).json({
//         status: resposne.successFalse,
//         message: "Invalid submission_ids array.",
//       });
//     }

//     // // // Check for existing submission IDs
//     // const existingSubmissionIds = await checkSubmissionId(submission_ids);

//     // // If there are existing records, delete them
//     // if (existingSubmissionIds.length > 0) {
//     //   await deleteExistingSubmissions(existingSubmissionIds);
//     // }

//     // Insert new records
//     const insertResults = await insertShortlistData(
//       eventId,
//       roundId,
//       submission_ids,
//       shortlist_round
//     );

//     return res.status(200).json({
//       status: resposne.successTrue,
//       message: "Shortlisted data inserted successfully.",
//       data: insertResults,
//     });
//   } catch (error) {
//     return res.status(400).json({
//       status: resposne.successFalse,
//       message: error.message,
//     });
//   }
// };

export const handleShortlistData = async (req, res) => {
  const role = req.user.role;

  if (role !== "admin") {
    return res.status(400).json({
      status: resposne.successFalse,
      message: resposne.unauth,
    });
  }

  const { eventId, roundId, submission_ids, shortlist_round } = req.body;
  try {
    await checkIfEventPlanExists(eventId);
  } catch (err) {
    return res.status(400).json({
      status: resposne.successFalse,
      message:
        err.message || "You have not added an event plan. Please update it.",
    });
  }
  try {
    const eventIdCheck = await checkeventId(eventId);
    if (!eventIdCheck) {
      return res.status(400).json({
        status: resposne.successFalse,
        message: resposne.eventIdfail,
      });
    }

    const roundIdCheck = await checkroundId(roundId);
    if (!roundIdCheck) {
      return res.status(400).json({
        status: resposne.successFalse,
        message: resposne.invalidroundId,
      });
    }

    if (!Array.isArray(submission_ids) || submission_ids.length === 0) {
      return res.status(400).json({
        status: resposne.successFalse,
        message: "Invalid submission_ids array.",
      });
    }

    // 🌟 Step 1: Check status, delete previous if exists, reject if unpaid
    await checkSubmissionIdAndDeleteIfShortlisted(submission_ids, eventId);

    // ✅ Step 2: Insert new shortlist data
    const insertResults = await insertShortlistData(
      eventId,
      roundId,
      submission_ids,
      shortlist_round,
    );

    return res.status(200).json({
      status: resposne.successTrue,
      message: "Shortlisted data inserted successfully.",
      data: insertResults,
    });
  } catch (error) {
    return res.status(400).json({
      status: resposne.successFalse,
      message: error.message,
    });
  }
};

export const getDatatoShortlist = async (req, res) => {
  const role = req.user.role;

  if (role !== "admin") {
    return res.status(400).json({
      status: resposne.successFalse,
      message: resposne.unauth,
    });
  }

  const { eventId } = req.query;

  const eventIdCheck = await checkeventId(eventId);
  if (!eventIdCheck) {
    return res.status(400).json({
      status: resposne.successFalse,
      message: resposne.eventIdfail,
    });
  }

  try {
    const uniqueSubmissions = await fetchUniqueSubmissionIds(eventId);

    if (uniqueSubmissions.length === 0) {
      return res.status(400).json({
        status: resposne.successFalse,
        message: resposne.nodatavail,
      });
    }

    const submissionData = [];
    for (const submission of uniqueSubmissions) {
      const submissionId = submission.submission_id;
      const fields = await fetchFieldsForSubmission(eventId, submissionId);
      submissionData.push({
        submission_id: submissionId,
        fields: fields,
      });
    }

    if (submissionData.length > 0) {
      return res.status(200).json({
        status: resposne.successTrue,
        message: resposne.fetchSuccess,
        data: submissionData,
      });
    } else {
      return res.status(400).json({
        status: resposne.successFalse,
        message: resposne.nodatavail,
      });
    }
  } catch (error) {
    return res.status(400).json({
      status: resposne.successFalse,
      message: error.message,
    });
  }
};

export const getShortlistData = async (req, res) => {
  const role = req.user.role;

  if (role !== "admin") {
    return res.status(400).json({
      status: resposne.successFalse,
      message: resposne.unauth,
    });
  }

  const { eventId, limit, skip } = req.query;

  const eventIdCheck = await checkeventId(eventId);
  if (!eventIdCheck) {
    return res.status(400).json({
      status: resposne.successFalse,
      message: resposne.eventIdfail,
    });
  }

  const parsedSkip = parseInt(skip, 10) || 0;
  const parsedLimit = parseInt(limit, 10) || 10;

  try {
    const results = await shortlistFetch(eventId, parsedSkip, parsedLimit);

    // If no data was returned, just send a success resposne with an empty array.
    if (results.length === 0) {
      return res.status(200).json({
        status: resposne.successTrue,
        message: resposne.nodatavail,
        data: [],
      });
    }

    return res.status(200).json({
      status: resposne.successTrue,
      message: resposne.fetchSuccess,
      data: results,
    });
  } catch (error) {
    return res.status(400).json({
      status: resposne.successFalse,
      message: error.message,
    });
  }
};

export const getShortlist = async (req, res) => {
  const { eventId, roundId, is_shortlist, limit, skip } = req.query;

  const limitValue = limit ? Math.max(parseInt(limit, 10), 100) : 100;
  const skipValue = skip ? Math.max(parseInt(skip, 10), 0) : 0;

  const eventIdCheck = await checkeventId(eventId);
  if (!eventIdCheck) {
    return res.status(400).json({
      status: resposne.successFalse,
      message: resposne.eventIdfail,
    });
  }

  try {
    if (is_shortlist === "0") {
      const [uniqueSubmissions, shortlistedData] = await Promise.all([
        fetchUniqueSubmissionIds(eventId),
        shortlistFetchno(eventId, limitValue, skipValue),
      ]);

      if (uniqueSubmissions.length === 0 && shortlistedData.length === 0) {
        return res.status(400).json({
          status: resposne.successFalse,
          message: resposne.nodatavail,
        });
      }

      const paginatedSubmissions = uniqueSubmissions.slice(
        skipValue,
        skipValue + limitValue,
      );
      const submissionData = [];

      for (const submission of paginatedSubmissions) {
        const submissionId = submission.submission_id;
        const fields = await fetchFieldsForSubmission(eventId, submissionId);

        // Extract unique `paymentstatus` values, ignoring `null`
        const paymentStatusSet = new Set(
          fields
            .map((field) => field.paymentstatus)
            .filter((status) => status !== null), // Remove null values
        );
        const shortlistData = shortlistedData.find(
          (item) => item.submission_id === submissionId,
        );
        const score = shortlistData ? shortlistData.score : 0; // Use default 0 if not found

        const paymentStatus =
          paymentStatusSet.size > 0
            ? Array.from(paymentStatusSet).join(", ") // Join if multiple statuses exist
            : "Pending"; // Default if none found

        console.log(
          "Submission ID:",
          submissionId,
          "Payment Status:",
          paymentStatus,
        );

        submissionData.push({
          submission_id: submissionId,
          fields: fields.map(({ field_name, field_value }) => ({
            field_name,
            field_value,
          })), // Exclude `paymentstatus`
          payment_status: paymentStatus, // Attach the extracted status
          score: score || 0, // Include the score from shortlistFetchno
        });
      }

      return res.status(200).json({
        status: resposne.successTrue,
        message: resposne.fetchSuccess,
        data: submissionData,
      });
    } else if (is_shortlist === "1") {
      const results = await shortlistFetch(
        eventId,
        roundId,
        limitValue,
        skipValue,
      );

      const roundIdCheck = await checkroundId(roundId);
      if (!roundIdCheck) {
        return res.status(400).json({
          status: resposne.successFalse,
          message: resposne.invalidroundId,
        });
      }
      if (results.error || results.length === 0) {
        return res.status(400).json({
          status: resposne.successFalse,
          message: `${resposne.nodatavail}, ${results.error || ""}`,
        });
      }

      return res.status(200).json({
        status: resposne.successTrue,
        message: resposne.fetchSuccess,
        data: results,
      });
    } else {
      return res.status(400).json({
        status: resposne.successFalse,
        message: "Invalid value for is_shortlist",
      });
    }
  } catch (error) {
    return res.status(400).json({
      status: resposne.successFalse,
      message: error.message,
    });
  }
};

export const customAllocate = async (req, res) => {
  const role = req.user.role;

  if (role !== "admin") {
    return res.status(400).json({
      status: resposne.successFalse,
      message: resposne.unauth,
    });
  }

  const { eventId, roundId, juryAssignId, email, submission_ids, allocation } =
    req.body;

  try {
    const eventIdCheck = await checkeventId(eventId);
    if (!eventIdCheck) {
      return res.status(400).json({
        status: resposne.successFalse,
        message: resposne.eventIdfail,
      });
    }

    const roundIdCheck = await checkroundId(roundId);
    if (!roundIdCheck) {
      return res.status(400).json({
        status: resposne.successFalse,
        message: resposne.invalidroundId,
      });
    }

    const juryAssignIdCheck = await checkJuryAssignId(juryAssignId);
    if (!juryAssignIdCheck) {
      return res.status(400).json({
        status: resposne.successFalse,
        message: resposne.invalidJuryAssignId,
      });
    }

    const existingAllocation = await checkAllocation(
      eventId,
      roundId,
      juryAssignId,
      email,
      submission_ids,
    );
    if (!existingAllocation.length) {
      const insertResults = await insertAllocation(
        eventId,
        roundId,
        juryAssignId,
        email,
        submission_ids,
        allocation,
      );
      return res.status(200).json({
        status: resposne.successTrue,
        message: "Allocations inserted successfully",
        data: insertResults,
      });
    }

    const allocationResults = await Promise.all(
      submission_ids.map(async (submission_id) => {
        const existingSubmission = await checkSubmissionExists(
          eventId,
          roundId,
          juryAssignId,
          email,
          submission_id,
        );

        if (existingSubmission.length) {
          const currentAllocation = existingSubmission[0].allocation;

          if (allocation === "non-abstain") {
            await deleteAllocation(
              eventId,
              roundId,
              juryAssignId,
              email,
              submission_id,
            );
            return null;
          }

          return await insertAllocation(
            eventId,
            roundId,
            juryAssignId,
            email,
            [submission_id],
            "abstain",
          );
        } else {
          return await insertAllocation(
            eventId,
            roundId,
            juryAssignId,
            email,
            [submission_id],
            "abstain",
          );
        }
      }),
    );

    const successfulAllocations = allocationResults
      .filter((result) => result !== null)
      .map((result) => (result instanceof Array ? result[0] : result));

    if (successfulAllocations.length > 0) {
      return res.status(200).json({
        status: resposne.successTrue,
        message: "Allocations processed successfully",
        data: successfulAllocations,
      });
    } else {
      return res.status(200).json({
        status: resposne.successTrue,
        message: "Allocations non-abstained successfully",
      });
    }
  } catch (error) {
    return res.status(400).json({
      status: resposne.successFalse,
      message: error.message,
    });
  }
};

export const getCustomAllocation = async (req, res) => {
  const role = req.user.role;

  if (role !== "admin") {
    return res.status(400).json({
      status: resposne.successFalse,
      message: resposne.unauth,
    });
  }

  const { eventId, roundId } = req.query;

  const eventIdCheck = await checkeventId(eventId);
  if (!eventIdCheck) {
    return res.status(400).json({
      status: resposne.successFalse,
      message: resposne.eventIdfail,
    });
  }
  const roundIdCheck = await checkroundId(roundId);
  if (!roundIdCheck) {
    return res.status(400).json({
      status: resposne.successFalse,
      message: resposne.eventIdfail,
    });
  }

  try {
    const results = await customAllocationFetch(eventId, roundId);

    if (results.error) {
      return res.status(400).json({
        status: resposne.successFalse,
        message: `${resposne.nodatavail},${results.error}`,
      });
    }

    return res.status(200).json({
      status: resposne.successTrue,
      message: resposne.fetchSuccess,
      data: results,
    });
  } catch (error) {
    return res.status(400).json({
      status: resposne.successFalse,
      message: error.message,
    });
  }
};

// export const getRegistrationData = async (req, res) => {
//   const role = req.user.role;

//   if (role !== "admin") {
//     return res.status(400).json({
//       status: resposne.successFalse,
//       message: resposne.unauth,
//     });
//   }

//   const { eventId, search, limit, skip } = req.query;

//   const eventIdCheck = await checkeventId(eventId);
//   if (!eventIdCheck) {
//     return res.status(400).json({
//       status: resposne.successFalse,
//       message: resposne.eventIdfail,
//     });
//   }

//   const searchTerm = search && search.trim() !== "" ? search.trim() : null;
//   const limitValue = parseInt(limit, 10) || 10;
//   const skipValue = parseInt(skip, 10) || 0;

//   try {
//     const result = await registrationDataFetch(eventId, searchTerm, limitValue, skipValue);

//     if (result.data.length === 0) {
//       return res.status(400).json({
//         status: resposne.successFalse,
//         message: resposne.nodatavail,
//       });
//     }

//     return res.status(200).json({
//       status: resposne.successTrue,
//       message: resposne.fetchSuccess,
//       data: result.data,
//       totalCount: result.totalCount
//     });

//   } catch (error) {
//     console.error('Error fetching registration data:', error);
//     return res.status(400).json({
//       status: resposne.successFalse,
//       message: error.message,
//     });
//   }
// };

export const exportRegData = async (req, res) => {
  // const { role } = req.user;

  // if (role !== "admin") {
  //   return res.status(400).json({
  //     status: resposne.successFalse,
  //     message: resposne.unauth,
  //   });
  // }

  const { eventId } = req.query;

  if (!eventId) {
    return res.status(400).json({
      status: resposne.successFalse,
      message: "Event ID is required.",
    });
  }
  const eventIdCheck = await checkeventId(eventId);
  if (!eventIdCheck) {
    return res.status(400).json({
      status: resposne.successFalse,
      message: resposne.eventIdfail,
    });
  }

  try {
    const [formSchema, registrationData] = await Promise.all([
      fetchFormSchema(eventId),
      exportRegistrationData(eventId),
    ]);

    if (!registrationData || registrationData.length === 0) {
      return res.status(400).json({
        status: resposne.successFalse,
        message: resposne.nodataDownload,
      });
    }

    if (!formSchema || formSchema.length === 0) {
      return res.status(400).json({
        status: resposne.successFalse,
        message: resposne.nodataDownload,
      });
    }

    const groupedData = groupRegistrationData(formSchema, registrationData);

    const workbook = await generateExcelFile(formSchema, groupedData);

    const eventName = registrationData[0]?.event_name || "Event";

    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    );
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=Registration_data_${eventName}.xlsx`,
    );

    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    res.status(400).json({
      status: resposne.successFalse,
      message: "Failed to generate registration data export.",
      error: error.message,
    });
  }
};

// export const getData = async (req, res) => {
//   const { eventId, search, limit, skip } = req.query;

//   // Validate eventId
//   const eventIdCheck = await checkeventId(eventId);
//   if (!eventIdCheck) {
//     return res.status(400).json({
//       status: resposne.successFalse,
//       message: "Invalid Event ID",
//     });
//   }

//   const searchTerm = search && search.trim() !== "" ? search.trim() : null;
//   const limitValue = parseInt(limit, 10) || 10;
//   const skipValue = parseInt(skip, 10) || 0;

//   try {
//     // Fetch the form field labels (schema)
//     const result = await registrationFieldsFetch(eventId);
//     if (result.data.length === 0) {
//       return res.status(400).json({
//         status: resposne.successFalse,
//         message: "No form schema available",
//       });
//     }

//     // Fetch the registration data
//     const fetchfields = await registrationDataFetch(eventId, searchTerm, limitValue, skipValue);

//     if (fetchfields.data.length === 0) {
//       return res.status(400).json({
//         status: resposne.successFalse,
//         message: "No registration data available",
//       });
//     }

//     // Process the fetched registration data and map it to include field values
//     const mappedData = fetchfields.data.map(fieldData => {
//       // Initialize an object to store the merged field values
//       const fields = result.data.reduce((acc, schemaField) => {
//         // Clean the schema field_name (remove the suffix)
//         const cleanedFieldName = schemaField.field_name.split('-')[0];

//         // Find the corresponding field in registration data based on the cleaned field name
//         const matchingField = fieldData.fields.find(f => f.field_name === cleanedFieldName);

//         if (matchingField) {
//           // If found, map the cleaned field_name to the corresponding value from registration data
//           acc[schemaField.field_name] = matchingField.field_value || '';  // If there's no value, set it to empty string
//         } else {
//           // If no matching field, set it as empty string
//           acc[schemaField.field_name] = '';
//         }

//         return acc;
//       }, {});

//       return {
//         ...fieldData,
//         fields,  // Merged fields with actual values (no matchedDataName here)
//       };
//     });

//     // Respond with both the schema (field labels) and registration data
//     return res.status(200).json({
//       status: "true",
//       message: "Data fetched successfully",
//       data: {
//         formSchema: result.data,  // Field labels from registration schema
//         registrationData: mappedData,  // Mapped registration data with field values
//       },
//       totalCount: fetchfields.totalCount,  // Total number of records
//     });

//   } catch (error) {
//     console.error('Error fetching registration data:', error);
//     return res.status(400).json({
//       status: resposne.successFalse,
//       message: error.message,
//     });
//   }
// };

export const getRegnData = async (req, res) => {
  const { eventId, search, limit, skip } = req.query;

  const eventIdCheck = await checkeventId(eventId);
  if (!eventIdCheck) {
    return res.status(400).json({
      status: resposne.successFalse,
      message: resposne.eventIdfail,
    });
  }

  const searchTerm = search && search.trim() !== "" ? search.trim() : null;
  const limitValue = parseInt(limit, 10) || 10;
  const skipValue = parseInt(skip, 10) || 0;

  try {
    const result = await registrationFieldsFetch(eventId);

    if (!result.data || result.data.length === 0) {
      return res.status(400).json({
        status: resposne.successFalse,
        message: "No form schema available",
      });
    }

    const fetchfields = await registrationDataFetch(
      eventId,
      searchTerm,
      limitValue,
      skipValue,
    );

    if (!fetchfields || fetchfields.length === 0) {
      return res.status(400).json({
        status: resposne.successFalse,
        message: "No registration data available",
      });
    }

    return res.status(200).json({
      status: resposne.successTrue,
      message: resposne.fetchSuccess,
      data: {
        formSchema: result.data,
        registrationData: fetchfields,
      },
      totalCount: fetchfields.length,
    });
  } catch (error) {
    return res.status(400).json({
      status: resposne.successFalse,
      message: error.message,
    });
  }
};
// export const getMergedData = async (req, res) => {
//   const { eventId, search, limit, skip } = req.query;

//   // Validate the eventId
//   const eventIdCheck = await checkeventId(eventId);
//   if (!eventIdCheck) {
//     return res.status(400).json({
//       status: resposne.successFalse,
//       message: resposne.eventIdfail,
//     });
//   }

//   const searchTerm = search?.trim() || null;
//   const limitValue = parseInt(limit, 10) > 0 ? parseInt(limit, 10) : 10;
//   const skipValue = parseInt(skip, 10) >= 0 ? parseInt(skip, 10) : 0;

//   // Helper to normalize submission fields to all entryFields with null if missing
//   const normalizeEntryFields = (entryItem, allEntryFields) => {
//     // Map from fields array to key:value object
//     const fieldMap = {};
//     if (Array.isArray(entryItem.fields)) {
//       entryItem.fields.forEach(fieldObj => {
//         // Each fieldObj has one key (except entryDataId)
//         Object.keys(fieldObj).forEach(key => {
//           if (key !== 'entryDataId') {
//             fieldMap[key] = fieldObj[key];
//           }
//         });
//       });
//     }

//     // Build normalized object with all fields
//     const normalizedFields = allEntryFields.map(field => {
//       const key = field.field_name;
//       return {
//         [key]: fieldMap.hasOwnProperty(key) ? fieldMap[key] : null,
//       };
//     });

//     // Return a new entryItem with normalized fields array
//     return {
//       ...entryItem,
//       fields: normalizedFields,
//     };
//   };

//   try {
//     // Fetch necessary data
//     const entryFields = await entryFieldsFetch(eventId);
//     const registrationFields = await registrationFieldsFetch(eventId);
//     const entrySubmissions = await entryDataFetch(
//       eventId,
//       searchTerm,
//       limitValue,
//       skipValue
//     );
//     const registrationSubmissions = await registrationDataFetch(eventId);
//     const adminDetails = await adminData(req.user.id, req.user.role);

//     if (!entryFields.data.length && !registrationFields.data.length) {
//       return res.status(400).json({
//         status: resposne.successFalse,
//         message: "No form schema available",
//       });
//     }

//     const mergedData = [];

//     // Loop over entry submissions and merge with registration data
//     entrySubmissions.mappedResults.forEach((entryItem) => {
//       // Find matching registration data by created_by and role
//       const matchingRegistration = registrationSubmissions.find(
//         (registration) =>
//           registration.created_by === entryItem.created_by &&
//           registration.role === entryItem.role
//       );

//       // Normalize entry submission fields to include all fields
//       const normalizedSubmissionData = normalizeEntryFields(entryItem, entryFields.data);

//       mergedData.push({
//         submission_id: entryItem.submission_id, // Unique key from entry data
//         registrationData: matchingRegistration || adminDetails,
//         submissionData: normalizedSubmissionData,
//       });
//     });

//     const totalCount = entrySubmissions.submissionIds.length;

//     return res.status(200).json({
//       status: resposne.successTrue,
//       message: resposne.fetchSuccess,
//       data: {
//         formSchema: {
//           registrationFields: registrationFields.data,
//           entryFields: entryFields.data,
//         },
//         mergedData,
//       },
//       totalCount,
//     });
//   } catch (error) {
//     return res.status(400).json({
//       status: resposne.successFalse,
//       message: error.message,
//     });
//   }
// };
export const query = (sql, values = []) => {
  return new Promise((resolve, reject) => {
    connection.query(sql, values, (error, results) => {
      if (error) return reject(error);
      return resolve([results]);
    });
  });
};
export const getMergedData = async (req, res) => {
  const { eventId, search, limit, skip } = req.query;

  // Validate the eventId
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
    const registrationFields = await registrationFieldsFetch(eventId);
    const entrySubmissions = await entryDataFetch(
      eventId,
      searchTerm,
      limitValue,
      skipValue,
    );
    const registrationSubmissions = await registrationDataFetch(eventId);
    const adminDetails = await adminData(req.user.id, req.user.role);

    if (!entryFields.data.length && !registrationFields.data.length) {
      return res.status(400).json({
        status: resposne.successFalse,
        message: "No form schema available",
      });
    }

    const mergedData = [];

    // 🔹 Fetch media files for all submissionIds
    let mediaFilesRows = [];
    const submissionIds = entrySubmissions.submissionIds || [];

    if (submissionIds.length > 0) {
      const placeholders = submissionIds.map(() => "?").join(",");
      const [mediaRows] = await query(
        `SELECT  id, submission_id, field_name, file_key, file_name, mime_type 
         FROM media_files 
         WHERE submission_id IN (${placeholders})`,
        submissionIds,
      );
      mediaFilesRows = Array.isArray(mediaRows) ? mediaRows : [];
    }

    // 🔹 Group media files by submission_id
    const mediaMap = {};
    mediaFilesRows.forEach((file) => {
      if (!mediaMap[file.submission_id]) {
        mediaMap[file.submission_id] = [];
      }
      mediaMap[file.submission_id].push({
        id: file.id, // ✅ Include media file I
        field_name: file.field_name,
        file_key: file.file_key,
        file_name: file.file_name,
        mime_type: file.mime_type,
      });
    });

    // 🔹 Merge all data
    entrySubmissions.mappedResults.forEach((entryItem) => {
      const matchingRegistration = registrationSubmissions.find(
        (registration) =>
          registration.created_by === entryItem.created_by &&
          registration.role === entryItem.role,
      );

      const media_files = mediaMap[entryItem.submission_id] || [];

      if (matchingRegistration) {
        mergedData.push({
          submission_id: entryItem.submission_id,
          registrationData: matchingRegistration,
          submissionData: {
            ...entryItem,
            media_files,
          },
        });
      } else {
        mergedData.push({
          submission_id: entryItem.submission_id,
          registrationData: adminDetails,
          submissionData: {
            ...entryItem,
            media_files,
          },
        });
      }
    });

    const totalCount = entrySubmissions.submissionIds.length;

    return res.status(200).json({
      status: resposne.successTrue,
      message: resposne.fetchSuccess,
      data: {
        formSchema: {
          registrationFields: registrationFields.data,
          entryFields: entryFields.data,
        },
        mergedData,
      },
      totalCount,
    });
  } catch (error) {
    console.error("getMergedData Error:", error);
    return res.status(400).json({
      status: resposne.successFalse,
      message: error.message,
    });
  }
};

// export const deleteShortlist = async (req, res) => {
//   const { role } = req.user;

//   if (role !== "admin") {
//     return res.status(400).json({
//       status: resposne.successFalse,
//       message: resposne.unauth,
//     });
//   }

//   const { submission_ids } = req.body;

//   const isValid = await checkSubIdShortlist(submission_ids);
//   if (!isValid) {
//     return res.status(400).json({
//       status: resposne.successFalse,
//       message: resposne.invalidsubmissionId,
//     });
//   }

//   try {
//     const result = await softDeleteShortlist(submission_ids);

//     if (result.affectedRows > 0) {
//       return res.status(200).json({
//         status: resposne.successTrue,
//         message: resposne.shortlistDeleteSuccess,
//       });
//     } else {
//       return res.status(400).json({
//         status: resposne.successFalse,
//         message: resposne.shortlistDeletefail,
//       });
//     }
//   } catch (error) {
//     return res.status(400).json({
//       status: resposne.successFalse,
//       message: error.message,
//     });
//   }
// };

export const deleteShortlist = async (req, res) => {
  const { role } = req.user;

  if (role !== "admin") {
    return res.status(400).json({
      status: resposne.successFalse,
      message: resposne.unauth,
    });
  }

  const { roundId, submission_ids } = req.body;

  const isValid = await checkSubIdShortlist(roundId, submission_ids);
  if (!isValid) {
    return res.status(400).json({
      status: resposne.successFalse,
      message: resposne.invalidsubmissionId,
    });
  }

  try {
    const result = await softDeleteShortlist(roundId, submission_ids);

    if (result.affectedRows > 0) {
      return res.status(200).json({
        status: resposne.successTrue,
        message: resposne.shortlistDeleteSuccess,
      });
    } else {
      return res.status(400).json({
        status: resposne.successFalse,
        message: resposne.shortlistDeletefail,
      });
    }
  } catch (error) {
    return res.status(400).json({
      status: resposne.successFalse,
      message: error.message,
    });
  }
};

export const exportmergedData = async (req, res) => {
  const { eventId, search, limit, skip } = req.query;

  try {
    const entryFieldsResult = await entryFieldsFetch(eventId);
    const registrationFieldsResult = await registrationFieldsFetch(eventId);

    if (
      entryFieldsResult.data.length === 0 &&
      registrationFieldsResult.data.length === 0
    ) {
      return res.status(400).json({
        status: "resposne.successFalse",
        message: "No form schema available",
      });
    }

    const entryData = await entryDataFetch(eventId, search, limit, skip);
    const registrationData = await registrationDataFetch(eventId);

    if (entryData.data.length === 0 && registrationData.data.length === 0) {
      return res.status(400).json({
        status: "resposne.successFalse",
        message: "No registration data available",
      });
    }

    // Merge data
    const mergedData = [];

    entryData.data.forEach((entry) => {
      const match = registrationData.data.find(
        (registration) => registration.created_by === entry.created_by,
      );
      if (match) {
        mergedData.push({
          ...entry,
          registrationData: match.fields,
        });
      } else {
        mergedData.push({
          ...entry,
          registrationData: null,
        });
      }
    });

    registrationData.data.forEach((registration) => {
      const match = mergedData.find(
        (item) => item.created_by === registration.created_by,
      );
      if (!match) {
        mergedData.push({
          entryData: null,
          ...registration,
        });
      }
    });

    const workbook = await generateMergedExcelFile(
      entryFieldsResult.data,
      registrationFieldsResult.data,
      mergedData,
    );

    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    );
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=Merged_Data_${eventId}.xlsx`,
    );

    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    return res.status(400).json({
      status: "resposne.successFalse",
      message: error.message,
    });
  }
};

export async function exportreportCsv(req, res) {
  const { role } = req.user;

  if (role !== "admin") {
    return res.status(400).json({
      status: resposne.successFalse,
      message: resposne.unauth,
    });
  }

  const { fields } = req.body;

  if (!fields) {
    return res.status(400).json({
      status: "error",
      message: "fields are required.",
    });
  }

  const selectedFields = fields.split(",");

  try {
    const rows = await fetchData(selectedFields);

    if (rows.length === 0) {
      return res.status(400).json({
        status: "error",
        message: "No data found.",
      });
    }

    const csv = parse(rows);

    res.header("Content-Type", "text/csv");
    res.attachment(`event_export.csv`);

    res.send(csv);
  } catch (error) {
    res.status(400).json({
      status: "error",
      message: "Error generating CSV.",
    });
  }
}

export const fetchcustomAllocation = async (req, res) => {
  const { role } = req.user;

  if (role !== "admin") {
    return res.status(400).json({
      status: resposne.successFalse,
      message: resposne.unauth,
    });
  }

  const { eventId, roundId, juryAssignId, email } = req.query;

  const eventIdCheck = await checkeventId(eventId);

  if (!eventIdCheck) {
    return res.status(400).json({
      status: resposne.successFalse,
      message: resposne.eventIdfail,
    });
  }

  const roundIdCheck = await checkroundId(roundId);
  if (!roundIdCheck) {
    return res.status(400).json({
      status: resposne.successFalse,
      message: resposne.eventIdfail,
    });
  }

  const juryAssignIdCheck = await checkJuryAssignId(juryAssignId);
  if (!juryAssignIdCheck) {
    return res.status(400).json({
      status: resposne.successFalse,
      message: resposne.invalidJuryAssignId,
    });
  }

  try {
    const test = await fetchAbstained(eventId, roundId, juryAssignId, email);
    const test2 = await customAllocationFetch(eventId, roundId);

    if (test && test2) {
      const filteredTest2 = test2.filter(
        (item2) =>
          !test.some((item1) => item1.submission_id === item2.submission_id),
      );

      const combinedData = [...test, ...filteredTest2];

      return res.status(200).json({
        status: resposne.successTrue,
        message: resposne.fetchSuccess,
        data: combinedData,
      });
    } else {
      return res.status(400).json({
        status: resposne.successFalse,
        message: resposne.nodatavail,
      });
    }
  } catch (error) {
    return res.status(400).json({
      status: resposne.successFalse,
      message: error.message,
    });
  }
};

export const fetchFormFields = async (req, res) => {
  const { role } = req.user;

  if (role !== "admin") {
    return res.status(400).json({
      status: resposne.successFalse,
      message: resposne.unauth,
    });
  }

  const { eventId } = req.query;

  const eventIdCheck = await checkeventId(eventId);
  if (!eventIdCheck) {
    return res.status(400).json({
      status: resposne.successFalse,
      message: resposne.eventIdfail,
    });
  }

  try {
    const entryFields = await entryFieldsFetch(eventId);

    const registrationFields = await registrationFieldsFetch(eventId);

    if (!entryFields.data.length && !registrationFields.data.length) {
      return res.status(400).json({
        status: resposne.successFalse,
        message: "No form schema available",
      });
    }

    return res.status(200).json({
      status: resposne.successTrue,
      message: resposne.fetchSuccess,
      formSchema: {
        registrationFields: registrationFields.data,
        entryFields: entryFields.data,
      },
    });
  } catch (error) {
    return res.status(400).json({
      status: resposne.successFalse,
      message: error.message,
    });
  }
};

export const registrationDataEdit = async (req, res) => {
  const userrole = req.user.role;

  if (userrole !== "admin" && userrole !== "user") {
    return res.status(400).json({
      status: resposne.successFalse,
      message: resposne.unauth,
    });
  }

  const { eventId, registrationFormId, created_by, role, updates } = req.body;

  const eventIdCheck = await checkeventId(eventId);
  if (!eventIdCheck) {
    return res.status(400).json({
      status: resposne.successFalse,
      message: resposne.eventIdfail,
    });
  }

  const RegFormIdCheck = await checkRegFormId(registrationFormId);
  if (!RegFormIdCheck) {
    return res.status(400).json({
      status: resposne.successFalse,
      message: resposne.regFormIdfail,
    });
  }

  try {
    const result = await registerUserUpdate(
      eventId,
      registrationFormId,
      created_by,
      role,
      updates,
    );

    if (result.affectedRows > 0) {
      return res.status(200).json({
        status: resposne.successTrue,
        message: resposne.RegistrationDataUpSuccess,
      });
    } else {
      return res.status(400).json({
        status: resposne.successFalse,
        message: resposne.noupdate,
      });
    }
  } catch (error) {
    return res.status(400).json({
      status: resposne.successFalse,
      message: error.message,
    });
  }
};

export const getRegnDataById = async (req, res) => {
  const { eventId, created_by, role } = req.query;

  const eventIdCheck = await checkeventId(eventId);
  if (!eventIdCheck) {
    return res.status(400).json({
      status: resposne.successFalse,
      message: resposne.eventIdfail,
    });
  }
  try {
    const fetchformFields = await registrationFieldsFetch(eventId);
    const fetchfields = await registrationDataFetchById(
      eventId,
      created_by,
      role,
    );

    if (!fetchfields) {
      return res.status(400).json({
        status: resposne.successFalse,
        message: resposne.noRegDataAvail,
      });
    }

    return res.status(200).json({
      status: resposne.successTrue,
      message: resposne.fetchSuccess,
      data: { formSchema: fetchformFields.data, fetchfields },
    });
  } catch (error) {
    return res.status(400).json({
      status: resposne.successFalse,
      message: error.message,
    });
  }
};

export const getEntryDataById = async (req, res) => {
  const { eventId, submission_id } = req.query;

  const eventIdCheck = await checkeventId(eventId);
  if (!eventIdCheck) {
    return res.status(400).json({
      status: resposne.successFalse,
      message: resposne.eventIdfail,
    });
  }

  try {
    const fetchformFields = await entryFieldsFetch(eventId);
    const fetchfields = await entryDataFetchById(eventId, submission_id);

    if (!fetchfields) {
      return res.status(400).json({
        status: resposne.successFalse,
        message: resposne.noEntryDataAvail,
      });
    }

    return res.status(200).json({
      status: resposne.successTrue,
      message: resposne.fetchSuccess,
      data: { formSchema: fetchformFields.data, fetchfields },
    });
  } catch (error) {
    return res.status(400).json({
      status: resposne.successFalse,
      message: error.message,
    });
  }
};

export const entryDataEdit = async (req, res) => {
  const userrole = req.user.role;

  if (userrole !== "admin" && userrole !== "user") {
    return res.status(400).json({
      status: resposne.successFalse,
      message: resposne.unauth,
    });
  }

  const { eventId, entryFormId, submission_id, updates } = req.body;

  const eventIdCheck = await checkeventId(eventId);
  if (!eventIdCheck) {
    return res.status(400).json({
      status: resposne.successFalse,
      message: resposne.eventIdfail,
    });
  }

  const entryFormIdCheck = await checkentryFormId(entryFormId);
  if (!entryFormIdCheck) {
    return res.status(400).json({
      status: resposne.successFalse,
      message: resposne.entryFormIdfail,
    });
  }

  try {
    const result = await entrantsDataUpdate(
      eventId,
      entryFormId,
      submission_id,
      updates,
    );

    if (result.affectedRows > 0) {
      return res.status(200).json({
        status: resposne.successTrue,
        message: resposne.EntryDataUpSuccess,
      });
    } else {
      return res.status(400).json({
        status: resposne.successFalse,
        message: resposne.noupdate,
      });
    }
  } catch (error) {
    return res.status(400).json({
      status: resposne.successFalse,
      message: error.message,
    });
  }
};

export const fetchJuryGroupFields = async (req, res) => {
  const { role } = req.user;

  if (role !== "admin") {
    return res.status(400).json({
      status: resposne.successFalse,
      message: resposne.unauth,
    });
  }

  const {
    eventId,
    roundId,
    name,
    formula,
    awardCategories,
    submissionFields,
    entrantFields,
    submissionIds,
    submissionValues,
    entrantValues,
  } = req.body;

  if (!name) {
    return res.status(400).json({
      status: resposne.successFalse,
      message: "Jury group name is required",
    });
  }

  let connection;
  try {
    connection = await createJuryGroup(eventId, roundId, name, formula);
    const juryGroupId = connection.juryGroupId;

    await insertAwardCategories(
      connection.connection,
      juryGroupId,
      awardCategories,
    );

    const submissionFieldIds = await insertSubmissionFields(
      connection.connection,
      juryGroupId,
      submissionFields,
    );
    await insertSubmissionFieldValues(
      connection.connection,
      juryGroupId,
      submissionFieldIds,
      submissionValues,
    );

    const entrantFieldIds = await insertEntrantFields(
      connection.connection,
      juryGroupId,
      entrantFields,
    );
    await insertEntrantFieldValues(
      connection.connection,
      juryGroupId,
      entrantFieldIds,
      entrantValues,
    );

    await insertSubmissionIds(
      connection.connection,
      juryGroupId,
      submissionIds,
    );

    await commitTransaction(connection.connection);

    res.status(200).json({
      status: resposne.successTrue,
      message: "Jury Group and details added successfully",
      juryGroupId,
    });
  } catch (error) {
    if (connection) {
      await rollbackTransaction(connection.connection);
    }
    res.status(400).json({
      status: resposne.successFalse,
      message: error.message,
    });
  } finally {
    if (connection) {
      releaseConnection(connection.connection);
    }
  }
};

export async function getAllgroup(req, res) {
  const { role } = req.user;

  if (role !== "admin") {
    return res.status(400).json({
      status: resposne.successFalse,
      message: resposne.unauth,
    });
  }

  const { eventId, roundId } = req.query;

  const eventIdCheck = await checkeventId(eventId);
  if (!eventIdCheck) {
    return res.status(400).json({
      status: resposne.successFalse,
      message: resposne.eventIdfail,
    });
  }

  const roundIdCheck = await checkroundId(roundId);
  if (!roundIdCheck) {
    return res.status(400).json({
      status: resposne.successFalse,
      message: resposne.roundIdfail,
    });
  }

  try {
    const result = await GetAlljudgeGroup(eventId, roundId);

    if (result.length === 0) {
      return res.status(400).json({
        status: resposne.successFalse,
        message: resposne.nodatavail,
      });
    }

    return res.status(200).json({
      status: resposne.successTrue,
      message: resposne.alljuryGroupFetchSuccess,
      data: result,
    });
  } catch (error) {
    return res.status(400).json({
      status: resposne.successFalse,
      message: error.message,
    });
  }
}

export async function getjudgeById(req, res) {
  const { role } = req.user;

  if (role !== "admin") {
    return res.status(400).json({
      status: resposne.successFalse,
      message: resposne.unauth,
    });
  }

  const { juryGroupId } = req.query;

  const groupIdCheck = await checkgroupId(juryGroupId);
  if (!groupIdCheck) {
    return res.status(400).json({
      status: resposne.successFalse,
      message: resposne.groupIdfail,
    });
  }

  try {
    const results = await GroupGetById(juryGroupId);
    if (results.length === 0) {
      return res.status(400).json({
        status: resposne.successFalse,
        message: resposne.nodatavail,
      });
    }
    return res.status(200).json({
      status: resposne.successTrue,
      message: resposne.fetchSuccess,
      data: results,
    });
  } catch (error) {
    return res.status(400).json({
      status: resposne.successFalse,
      message: error.message,
    });
  }
}

export const deleteJuryGroup = async (req, res) => {
  const { role } = req.user;

  if (role !== "admin") {
    return res.status(400).json({
      status: resposne.successFalse,
      message: resposne.unauth,
    });
  }

  const { juryGroupId } = req.query;

  const groupIdCheck = await checkgroupId(juryGroupId);
  if (!groupIdCheck) {
    return res.status(400).json({
      status: resposne.successFalse,
      message: resposne.groupIdfail,
    });
  }

  try {
    const result = await deleteJuryGroupById(juryGroupId);
    return res.status(200).json({
      status: resposne.successTrue,
      message: result.message,
    });
  } catch (error) {
    return res.status(400).json({
      status: resposne.successFalse,
      message: error.message,
    });
  }
};

export const getBackdoor = async (req, res) => {
  const { role } = req.user;

  if (role !== "admin") {
    return res.status(400).json({
      status: resposne.successFalse,
      message: resposne.unauth,
    });
  }

  const adminId = req.user.id;
  const { eventId } = req.query;

  const eventIdCheck = await checkeventId(eventId);
  if (!eventIdCheck) {
    return res.status(400).json({
      status: resposne.successFalse,
      message: resposne.eventIdfail,
    });
  }

  const adminIdCheck = await checkadminIdEvent(adminId, eventId);
  if (!adminIdCheck) {
    return res.status(400).json({
      status: resposne.successFalse,
      message: resposne.invldadminEvent,
    });
  }

  const backdoorCheck = await checkBackdoor(eventId);
  if (!backdoorCheck) {
    return res.status(400).json({
      status: resposne.successFalse,
      message: resposne.backdoorUnAvail,
    });
  }

  try {
    const result = await backdoorGet(eventId);
    if (result) {
      return res.status(200).json({
        status: resposne.successTrue,
        message: resposne.fetchSuccess,
        data: result,
      });
    } else {
      return res.status(400).json({
        status: resposne.successFalse,
        message: resposne.nodatavail,
      });
    }
  } catch (error) {
    return res.status(400).json({
      status: resposne.successFalse,
      message: error.message,
    });
  }
};

export const backdoorDelete = async (req, res) => {
  const { role } = req.user;

  if (role !== "admin") {
    return res.status(400).json({
      status: resposne.successFalse,
      message: resposne.unauth,
    });
  }
  const { eventId } = req.query;

  const eventExists = await checkeventId(eventId);
  if (!eventExists) {
    return res.status(400).json({
      status: resposne.successFalse,
      message: resposne.eventnotfound,
    });
  }
  try {
    const message = await deletebackdoor(eventId);
    if (message.affectedRows === 0) {
      return res.status(400).json({
        status: resposne.successFalse,
        message: resposne.deletebackdoorError,
      });
    }
    return res.status(200).json({
      status: resposne.successTrue,
      message: resposne.backdoorDeleteSuccess,
    });
  } catch (error) {
    return res.status(400).json({
      status: resposne.successFalse,
      message: error.message,
    });
  }
};

// Promisify query execution for easier async/await handling
function queryAsync(query, values) {
  return new Promise((resolve, reject) => {
    connection.query(query, values, (error, results) => {
      if (error) {
        reject(error);
      } else {
        resolve(results);
      }
    });
  });
}

export async function ExchelJuryScoreReport(req, res) {
  const { eventId, filters, forexchelheader, roundId } = req.body;

  // Validate eventId and roundId
  const eventIdCheck = await checkeventId(eventId);
  const roundIdCheck = await checkroundId(roundId);
  if (!eventIdCheck || !roundIdCheck) {
    return res.status(400).json({
      status: response.successFalse,
      message: response.invalidEventOrRoundId,
    });
  }

  try {
    // Build dynamic WHERE clause from filters
    let whereClause = "eventId = ?";
    const values = [eventId];

    for (const field in filters) {
      whereClause += ` AND field_name = ? AND field_value = ?`;
      values.push(field, filters[field]);
    }

    // Fetch submission IDs that match the filters
    const filteredRows = await queryAsync(
      `SELECT DISTINCT submission_id FROM entry_data WHERE ${whereClause}`,
      values,
    );

    if (filteredRows.length === 0) {
      return res.status(404).json({
        status: response.successFalse,
        message: "No matching data found.",
      });
    }

    const submissionIds = filteredRows.map((row) => row.submission_id);

    // Filter submission IDs by shortlist_data for the specified eventId and roundId
    const shortlistedRows = await queryAsync(
      `SELECT submission_id FROM shortlist_data WHERE eventId = ? AND roundId = ? AND submission_id IN (?) AND is_deleted = 0`,
      [eventId, roundId, submissionIds],
    );

    if (shortlistedRows.length === 0) {
      return res.status(404).json({
        status: response.successFalse,
        message: "No shortlisted data found for the specified event and round.",
      });
    }

    const shortlistedSubmissionIds = shortlistedRows.map(
      (row) => row.submission_id,
    );

    // Fetch all related fields for the shortlisted submission IDs
    const allRows = await queryAsync(
      `SELECT submission_id, field_name, field_value FROM entry_data WHERE submission_id IN (?)`,
      [shortlistedSubmissionIds],
    );

    // Fetch total jury scores for each submission
    const juryScores = await queryAsync(
      `SELECT submission_id, SUM(total) AS total_score 
       FROM jury_score 
       WHERE submission_id IN (?) 
       GROUP BY submission_id`,
      [shortlistedSubmissionIds],
    );

    // Convert jury score data into a map
    const juryScoreMap = {};
    juryScores.forEach(({ submission_id, total_score }) => {
      juryScoreMap[submission_id] = total_score || 0;
    });

    // Group data by submission ID
    const groupedData = {};
    allRows.forEach(({ submission_id, field_name, field_value }) => {
      if (!groupedData[submission_id]) groupedData[submission_id] = {};
      groupedData[submission_id][field_name] = field_value;
    });

    // Generate Excel file
    const workbook = new excelJS.Workbook();
    const worksheet = workbook.addWorksheet("Jury Score Report");

    // Define headers (Submission ID + Selected Fields + Total Jury Score)
    const headers = [
      "Submission ID",
      ...forexchelheader.map((field) => field.label),
      "Total Jury Score",
    ];
    worksheet.addRow(headers);

    // Add data rows
    shortlistedSubmissionIds.forEach((submissionId) => {
      const rowData = [
        submissionId,
        ...forexchelheader.map(
          (field) => groupedData[submissionId]?.[field.field_name] || "",
        ),
        juryScoreMap[submissionId] || 0, // Add Total Jury Score
      ];
      worksheet.addRow(rowData);
    });

    // Send file as response
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    );
    res.setHeader(
      "Content-Disposition",
      "attachment; filename=JuryScoreReport.xlsx",
    );

    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    console.error("Error generating Excel:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}

export async function ExhelEntrydata(req, res) {
  const { eventId, selectedColumns, selectedLabels } = req.body;

  const eventIdCheck = await checkeventId(eventId);
  if (!eventIdCheck) {
    return res.status(400).json({
      status: resposne.successFalse,
      message: resposne.eventIdfail,
    });
  }

  try {
    if (!eventId || !selectedColumns.length || !selectedLabels.length) {
      return res.status(400).json({
        status: resposne.successFalse,
        message: "Invalid input",
      });
    }

    // ✅ Await getEntryData (Now It Returns a Promise)
    const rows = await getEntryData(eventId, selectedColumns);

    if (!rows.length) {
      return res.status(400).json({
        status: resposne.successFalse,
        message: "No data found",
      });
    }

    const buffer = await generateExcel(rows, selectedColumns, selectedLabels);

    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    );
    res.setHeader(
      "Content-Disposition",
      "attachment; filename=entry_data.xlsx",
    );

    res.send(buffer);
  } catch (error) {
    console.error("Error downloading entry data:", error);
    res.status(400).json({
      status: resposne.successFalse,
      message: error.message,
    });
  }
}

export const getEventsController = async (req, res) => {
  try {
    const adminId = req.user.id; // Get adminId from authenticated user
    const { sortBy, status } = req.query; // Get sorting and status filters from request

    let events = await getEventsByAdmin(adminId, sortBy);

    // Apply status filters (if provided)
    if (status) {
      events = events.filter((event) => event[status] === 1); // Filtering by is_archive, is_draft, or is_live
    }

    res.status(200).json({
      success: true,
      data: events,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

export const Adminsget = async (req, res) => {
  const role = req.user.special_role;

  if (role !== "superadmin") {
    return res.status(400).json({
      status: resposne.successFalse,
      message: resposne.unauth,
    });
  }

  try {
    const result = await getAllAdmins();

    const filteredAdmins = result.admins.filter(
      (admin) => admin.adminId !== req.user.id,
    );

    if (filteredAdmins.length === 0) {
      return res.status(400).json({
        status: resposne.successFalse,
        message: resposne.nodatavail,
      });
    } else {
      return res.status(200).json({
        status: resposne.successTrue,
        message: resposne.fetchSuccess,
        data: filteredAdmins,
      });
    }
  } catch (error) {
    return res.status(400).json({
      status: resposne.successFalse,
      message: error.message,
    });
  }
};

export const blockAdmin = async (req, res) => {
  const { adminId, block } = req.query;

  try {
    if (!adminId || block === undefined) {
      return res.status(400).json({
        status: resposne.successFalse,
        message: "Invalid parameters",
      });
    }

    const successMessage = await adminblocking(adminId, block);

    return res.status(200).json({
      status: resposne.successTrue,
      message: successMessage,
    });
  } catch (error) {
    console.error("Block Admin Error:", error);
    return res.status(400).json({
      status: resposne.successFalse,
      message: error.message || "Something went wrong",
    });
  }
};

export const getProgressJury = async (req, res) => {
  const role = req.user.role;

  if (role !== "admin") {
    return res.status(400).json({
      status: resposne.successFalse,
      message: resposne.unauth,
    });
  }
  const { eventId } = req.query;

  const eventIdCheck = await checkeventId(eventId);
  if (!eventIdCheck) {
    return res.status(400).json({
      status: resposne.successFalse,
      message: resposne.eventIdfail,
    });
  }
  try {
    const result = await getJuryProgress(eventId);

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
export const couponGet = async (req, res) => {
  try {
    const { couponId, baseTotalPrice, eventId } = req.query;

    if (!couponId || !baseTotalPrice || !eventId) {
      return res
        .status(400)
        .json({ error: "couponId, baseTotalPrice, and eventId are required" });
    }

    const result = await coupongetAdmin(couponId, baseTotalPrice, eventId);

    return res.status(200).json({
      success: true,
      message: "Coupon applied successfully",
      data: result,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const getCoupon = async (req, res) => {
  const { role } = req.user;

  if (role !== "admin") {
    return res.status(403).json({
      status: false,
      message: "Unauthorized access.",
    });
  }

  const { eventId } = req.params;

  if (!eventId) {
    return res
      .status(400)
      .json({ status: false, message: "Provide Event ID." });
  }

  // Ensure eventId exists in the database
  const eventIdCheck = await checkeventId(eventId);
  if (!eventIdCheck) {
    return res.status(404).json({
      status: false,
      message: "Invalid Event ID.",
    });
  }

  try {
    const result = await Couponget(eventId);

    return res.status(200).json({
      status: true,
      message: "Coupons retrieved successfully.",
      data: result, // Return actual coupon data
    });
  } catch (error) {
    return res.status(500).json({
      status: false,
      message: error.message || "Internal Server Error",
    });
  }
};

export const deleteCoupon = async (req, res) => {
  const { role } = req.user;

  if (role !== "admin") {
    return res.status(403).json({
      status: false,
      message: "Unauthorized access.",
    });
  }

  const { couponId } = req.params;

  if (!couponId) {
    return res
      .status(400)
      .json({ status: false, message: "Provide Coupon ID." });
  }

  try {
    const deleted = await CouponDelete(couponId);

    if (!deleted) {
      return res.status(400).json({
        status: false,
        message: "Coupon not found or already deleted.",
      });
    }

    return res.status(200).json({
      status: true,
      message: "Coupon deleted successfully.",
    });
  } catch (error) {
    return res.status(400).json({
      status: false,
      message: error.message || "Internal Server Error",
    });
  }
};

export const updateCoupon = async (req, res) => {
  const { role } = req.user;
  const { couponId } = req.params;
  const {
    coupon_name,
    coupon_code,
    percent_off,
    coupon_amount,
    start_date,
    end_date,
    is_active,
    eventId,
    awardId,
  } = req.body;

  if (role !== "admin") {
    return res
      .status(400)
      .json({ status: false, message: "Unauthorized access." });
  }

  if (!couponId) {
    return res
      .status(400)
      .json({ status: false, message: "Coupon ID is required." });
  }

  // Optional: validate eventId if you're updating it
  if (eventId) {
    const isValidEvent = await checkeventId(eventId);
    if (!isValidEvent) {
      return res
        .status(400)
        .json({ status: false, message: "Invalid Event ID." });
    }
  }

  try {
    const updated = await CouponUpdate(couponId, {
      coupon_name,
      coupon_code,
      percent_off,
      coupon_amount,
      start_date,
      end_date,
      is_active,
      eventId,
      awardId,
    });

    if (!updated) {
      return res.status(400).json({
        status: false,
        message: "Coupon not found or already deleted.",
      });
    }

    return res
      .status(200)
      .json({ status: true, message: "Coupon updated successfully." });
  } catch (error) {
    return res.status(400).json({ status: false, message: error.message });
  }
};

export const getAdminPaymentGateList = async (req, res) => {
  const role = req.user.role;

  if (role !== "admin") {
    return res.status(400).json({
      status: resposne.successFalse,
      message: resposne.unauth,
    });
  }

  const { eventId } = req.query;

  if (!eventId) {
    return res.status(400).json({ status: false, message: "Provide eventId" });
  }

  try {
    const results = await getPaymentGateway(eventId);

    if (results.length === 0) {
      return res.status(404).json({
        status: false,
        message: "No data found for this event and user.",
      });
    }

    return res.status(200).json({
      status: true,
      data: results,
    });
  } catch (error) {
    return res
      .status(500)
      .json({ status: false, message: "Server error: " + error.message });
  }
};
export const ExceltopJuryScoreReport = async (req, res) => {
  try {
    const { eventId, roundId, selectedCategories, judgeIds } = req.body;

    if (!eventId || !roundId || !Array.isArray(selectedCategories)) {
      return res.status(400).json({ message: "Missing or invalid parameters" });
    }

    await getShortlistedEntries(
      eventId,
      selectedCategories,
      judgeIds,
      roundId,
      async (err, data) => {
        if (err) {
          console.error("Error fetching shortlisted entries:", err);
          return res.status(500).json({ message: "Internal Server Error" });
        }

        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet("Jury Score Report");

        // Get all unique field names (static + dynamic)
        const defaultKeys = [
          "submission_id",
          "judgeId",
          "judgeEmail",
          "awardId",
          "roundId",
          "eventId",
          "total",
          "abstain",
          "comment",
          "status",
          "is_confirmed",
          "created_at",
          "updated_at",
        ];

        const dynamicHeaders = new Set();
        data.forEach((row) => {
          Object.keys(row).forEach((key) => {
            if (!defaultKeys.includes(key)) {
              dynamicHeaders.add(key);
            }
          });
        });

        // Set headers
        const headers = [...defaultKeys, ...Array.from(dynamicHeaders)].map(
          (key) => ({
            header: key,
            key: key,
            width: 20,
          }),
        );

        worksheet.columns = headers;

        // Add rows
        data.forEach((row) => {
          worksheet.addRow(row);
        });

        // Set response headers
        res.setHeader(
          "Content-Type",
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        );
        res.setHeader(
          "Content-Disposition",
          "attachment; filename=JuryScoreReport.xlsx",
        );

        // Stream Excel to client
        await workbook.xlsx.write(res);
        res.end();
      },
    );
  } catch (error) {
    console.error("Unexpected error in ExceltopJuryScoreReport:", error);
    return res.status(500).json({ message: "Unexpected Server Error" });
  }
};

// export const sheet = async (req, res) => {
//   try {
//     const { eventId, roundId, awardIds, judgeIds } = req.body;

//     // Step 1: Fetch judge emails based on event and round
//     const judgedetail = judgeIds?.length
//       ? await getJuryEmailsByIds(judgeIds) // Optional: Add this fallback if needed
//       : await getJuryEmailsByEventAndRound(eventId, roundId);

//     if (!judgedetail?.length) {
//       return res
//         .status(404)
//         .json({ message: "No judges found for this round." });
//     }

//     // Step 2: Get entry data for provided event and awards
//     const userentrydata = await entrydatagetSubmission(eventId, awardIds);
//     if (!userentrydata?.length) {
//       return res
//         .status(404)
//         .json({ message: "No submissions found for the event/awards." });
//     }

//     // Step 3: Get jury scores
//     const jurysore = await getJuryScore(eventId, awardIds, roundId, judgeIds);

//     // Step 4: Create a map for quick score lookup
//     const scoreMap = new Map();
//     jurysore.forEach((score) => {
//       const key = `${score.submission_id}_${score.awardId}_${score.judgeId}`;
//       scoreMap.set(key, {
//         total: score.total,
//         comment: score.comment,
//       });
//     });

//     // Step 5: Structure the final data
//     const structuredData = userentrydata.map((entry) => {
//       const { submission_id, awardcatId, field_value } = entry;

//       const judgesWithStatus = judgedetail.map((judge) => {
//         const key = `${submission_id}_${awardcatId}_${judge.judgeId}`;
//         const scoreData = scoreMap.get(key);
//         return {
//           judgeId: judge.judgeId,
//           email: judge.email,
//           scored: !!scoreData,
//           score: scoreData?.total ?? "",
//           comment: scoreData?.comment ?? "",
//         };
//       });

//       return {
//         submission_id,
//         awardcatId,
//         field_value,
//         judges: judgesWithStatus,
//       };
//     });

//     // Step 6: Create Excel workbook
//     const workbook = new ExcelJS.Workbook();
//     const sheet = workbook.addWorksheet("Judging Report");

//     // Step 7: Build header row
//     const headers = [
//       "Submission ID",
//       "Award Category ID",
//       "Field Value",
//       ...judgedetail.flatMap((j) => [`${j.email} Score`, `${j.email} Comment`]),
//     ];
//     sheet.addRow(headers);

//     // Step 8: Populate rows
//     structuredData.forEach((entry) => {
//       const baseRow = [
//         entry.submission_id,
//         entry.awardcatId,
//         entry.field_value,
//       ];

//       const judgeScores = entry.judges.flatMap((j) => [j.score, j.comment]);

//       const row = [...baseRow, ...judgeScores];
//       sheet.addRow(row);

//       // Optional Debug
//       if (row.length !== headers.length) {
//         console.warn(
//           `⚠️ Row length mismatch for submission ${entry.submission_id}`
//         );
//       }
//     });

//     // Step 9: Create file path and write
//     const filename = `Judging_Report_${eventId}_Round${roundId}.xlsx`;
//     const filepath = path.join("/tmp", filename); // Update to your preferred path

//     await workbook.xlsx.writeFile(filepath);

//     // Step 10: Send for download
//     res.download(filepath, filename, (err) => {
//       if (err) {
//         console.error("Download error:", err);
//         return res.status(500).send("Could not download file");
//       }

//       // Optional cleanup
//       fs.unlinkSync(filepath);
//     });
//   } catch (error) {
//     console.error("Error generating Excel sheet:", error);
//     return res.status(500).json({ message: "Unexpected Server Error" });
//   }
// };

// export const sheet = async (req, res) => {
//   try {
//     const { eventId, roundId, awardIds, judgeIds } = req.body;

//     // Step 0: Fetch event settings
//     const overallScoreSetting = await eventscoreget(roundId, eventId);
//     // Convert both to lowercase and trim any whitespace
//     const useOverallScoring =
//     overallScoreSetting?.trim() === "{Total Number of Assigned Judges}";

//     console.log("event details", overallScoreSetting); // Debug: {Total Score}
//     console.log("Event uses overall scoring?", useOverallScoring);

//     // Step 1: Fetch judge emails
//     const judgedetail = judgeIds?.length
//       ? await getJuryEmailsByIds(judgeIds)
//       : await getJuryEmailsByEventAndRound(eventId, roundId);

//     if (!judgedetail?.length) {
//       return res
//         .status(404)
//         .json({ message: "No judges found for this round." });
//     }

//     // Step 2: Get entry submissions
//     const userentrydata = await entrydatagetSubmission(eventId, awardIds);
//     if (!userentrydata?.length) {
//       return res
//         .status(404)
//         .json({ message: "No submissions found for the event/awards." });
//     }

//     // Step 3: Get jury scores
//     const jurysore = await getJuryScore(eventId, awardIds, roundId, judgeIds);

//     // Step 4: Map jury scores
//     const scoreMap = new Map();
//     jurysore.forEach((score) => {
//       const key = `${score.submission_id}_${score.awardId}_${score.judgeId}`;
//       scoreMap.set(key, {
//         total: score.total,
//         comment: score.comment,
//       });
//     });

//     // Step 5: Structure data
//     const structuredData = userentrydata.map((entry) => {
//       const { submission_id, awardcatId, field_value } = entry;

//       const judgesWithStatus = judgedetail.map((judge) => {
//         const key = `${submission_id}_${awardcatId}_${judge.judgeId}`;
//         const scoreData = scoreMap.get(key);
//         return {
//           judgeId: judge.judgeId,
//           email: judge.email,
//           scored: !!scoreData,
//           score: scoreData?.total ?? "",
//           comment: scoreData?.comment ?? "",
//         };
//       });

//       return {
//         submission_id,
//         awardcatId,
//         field_value,
//         judges: judgesWithStatus,
//       };
//     });

//     // Step 6: Create Excel workbook
//     const workbook = new ExcelJS.Workbook();
//     const sheet = workbook.addWorksheet("Judging Report");

//     // Step 7: Build header row
//     const headers = [
//       "Submission ID",
//       "Award Category ID",
//       "Field Value",
//       ...judgedetail.flatMap((j) => [`${j.email} Score`, `${j.email} Comment`]),
//     ];

//       headers.push("Total Score");

//     sheet.addRow(headers);

//     // Step 8: Add submission rows
//     structuredData.forEach((entry) => {
//       const baseRow = [
//         entry.submission_id,
//         entry.awardcatId,
//         entry.field_value,
//       ];

//       const judgeScores = entry.judges.flatMap((j) => [j.score, j.comment]);

//       let row = [...baseRow, ...judgeScores];

//       // Calculate score (either average or sum)
//       const validScores = entry.judges
//         .map((j) => parseFloat(j.score))
//         .filter((score) => !isNaN(score));

//       const totalScore = validScores.reduce((a, b) => a + b, 0);

//       let finalScore = "";

//       if (validScores.length > 0) {
//         if (useOverallScoring) {
//           // Average
//           const totalAssignedJudges = entry.judges.length;
//           finalScore = (totalScore / totalAssignedJudges).toFixed(2);
//         } else {
//           // Sum
//           finalScore = totalScore.toFixed(2);
//         }

//         row.push(finalScore);
//       } else {
//         row.push(""); // No score available
//       }

//       sheet.addRow(row);

//       if (row.length !== headers.length) {
//         console.warn(`⚠️ Row length mismatch for submission ${entry.submission_id}`);
//       }
//     });

//     // Step 9: Save to temp path
//     const filename = `Judging_Report_${eventId}_Round${roundId}.xlsx`;
//     const filepath = path.join("/tmp", filename);

//     await workbook.xlsx.writeFile(filepath);

//     // Step 10: Send file for download
//     res.download(filepath, filename, (err) => {
//       if (err) {
//         console.error("Download error:", err);
//         return res.status(500).send("Could not download file");
//       }

//       // Optional file cleanup
//       try {
//         fs.unlinkSync(filepath);
//       } catch (e) {
//         console.warn("Temp file could not be deleted:", e);
//       }
//     });
//   } catch (error) {
//     console.error("Error generating Excel sheet:", error);
//     return res.status(500).json({ message: "Unexpected Server Error" });
//   }
// };

export const sheet = async (req, res) => {
  try {
    const { eventId, roundId, awardIds, judgeIds, forexchelheader } = req.body;

    // Step 0: Fetch event settings
    const overallScoreSetting = await eventscoreget(roundId, eventId);
    const useOverallScoring =
      overallScoreSetting?.trim() === "{Total Number of Assigned Judges}";

    // Step 1: Fetch judge emails
    const judgedetail = judgeIds?.length
      ? await getJuryEmailsByIds(judgeIds)
      : await getJuryEmailsByEventAndRound(eventId, roundId);

    if (!judgedetail?.length) {
      return res
        .status(404)
        .json({ message: "No judges found for this round." });
    }

    // Step 2: Get entry submissions
    const userentrydata = await entrydatagetSubmission(eventId, awardIds);
    if (!userentrydata?.length) {
      return res
        .status(404)
        .json({ message: "No submissions found for the event/awards." });
    }
    console.log("User Entry Data:", userentrydata);
    // Step 3: Get jury scores
    const jurysore = await getJuryScore(eventId, awardIds, roundId, judgeIds);

    // Step 4: Map jury scores
    const scoreMap = new Map();
    jurysore.forEach((score) => {
      const key = `${score.submission_id}_${score.awardId}_${score.judgeId}`;
      scoreMap.set(key, {
        total: score.total,
        comment: score.comment,
      });
    });

    // Step 5: Group field values by submission
    const submissionMap = new Map();
    userentrydata.forEach((entry) => {
      if (!submissionMap.has(entry.submission_id)) {
        submissionMap.set(entry.submission_id, {
          submission_id: entry.submission_id,
          awardcatId: entry.awardcatId,
          fields: {},
        });
      }
      const submission = submissionMap.get(entry.submission_id);
      submission.fields[entry.field_name] = entry.field_value;
    });

    // Step 6: Create Excel workbook
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet("Judging Report");

    // Step 7: Build header row
    const headers = [
      "Submission ID",
      "Award Category ID",
      ...forexchelheader.map((f) => f.label), // Dynamic fields
      ...judgedetail.flatMap((j) => [`${j.email} Score`, `${j.email} Comment`]),
      "Total Score",
    ];

    sheet.addRow(headers);

    // Step 8: Add submission rows
    submissionMap.forEach((submission) => {
      const baseRow = [submission.submission_id, submission.awardcatId];

      // Fill dynamic field values
      const dynamicFieldValues = forexchelheader.map((f) => {
        return submission.fields[f.field_name] || "";
      });
      console.log("Dynamic Field Values:", dynamicFieldValues);
      // Judge Scores and Comments
      const judgeScores = judgedetail.flatMap((judge) => {
        const key = `${submission.submission_id}_${submission.awardcatId}_${judge.judgeId}`;
        const scoreData = scoreMap.get(key);
        return [scoreData?.total ?? "", scoreData?.comment ?? ""];
      });

      // Calculate total score
      const validScores = judgedetail
        .map((judge) => {
          const key = `${submission.submission_id}_${submission.awardcatId}_${judge.judgeId}`;
          const scoreData = scoreMap.get(key);
          return parseFloat(scoreData?.total);
        })
        .filter((score) => !isNaN(score));

      let finalScore = "";
      if (validScores.length > 0) {
        if (useOverallScoring) {
          const totalAssignedJudges = judgedetail.length;
          finalScore = (
            validScores.reduce((a, b) => a + b, 0) / totalAssignedJudges
          ).toFixed(2);
        } else {
          finalScore = validScores.reduce((a, b) => a + b, 0).toFixed(2);
        }
      }

      const row = [
        ...baseRow,
        ...dynamicFieldValues,
        ...judgeScores,
        finalScore,
      ];
      sheet.addRow(row);
    });

    // Step 9: Save and download
    const filename = `Judging_Report_${eventId}_Round${roundId}.xlsx`;
    const filepath = path.join("/tmp", filename);

    await workbook.xlsx.writeFile(filepath);

    res.download(filepath, filename, (err) => {
      if (err) {
        console.error("Download error:", err);
        return res.status(500).send("Could not download file");
      }
      try {
        fs.unlinkSync(filepath);
      } catch (e) {
        console.warn("Temp file could not be deleted:", e);
      }
    });
  } catch (error) {
    console.error("Error generating Excel sheet:", error);
    return res.status(500).json({ message: "Unexpected Server Error" });
  }
};

export const UserFormCategoryList = async (req, res) => {
  const { eventId, search, sortOrder } = req.query;
  const searchTerm = search && search.trim() !== "" ? search : null;
  const order = sortOrder === "oldest" ? "oldest" : "newest";

  try {
    const result = await UserCatgeoryFormList(eventId, searchTerm, order);

    if (result.length > 0) {
      return res.status(200).json({
        status: resposne.successTrue,
        message: resposne.fetchSuccess,
        data: result,
      });
    } else {
      return res.status(400).json({
        status: resposne.successFalse,
        message: resposne.nodatavail,
      });
    }
  } catch (error) {
    return res.status(400).json({
      status: resposne.successFalse,
      message: error.message,
    });
  }
};
