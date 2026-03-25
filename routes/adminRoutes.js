import express from "express"
import {
     AdminProfileget,
     Adminsget,
     AssignJuryCreate,
     AwardByIdget,
     awardCreate,
     Awardsget,
     awardUpdate,
     backdoorDelete,
     blockAdmin,
     couponGet,
     CreateCoupon,
     createEntryForm,
     CreateGeneralSettings,
     createRegistrationForm,
     createScoreForm,
     createScoreForm1,
     customAllocate,
     dashboardEvents,
     deleteAward,
     deleteCoupon,
     deletejuryAssign,
     deleteJuryGroup,
     deleteScorecard,
     deleteShortlist,
     entryDataEdit,
     eventCreate,
     EventgetUser,
     EventStatus,
     eventUpdate,
     eventupdateSocial,
     ExceltopJuryScoreReport,
     ExchelJuryScoreReport,
     ExhelEntrydata,
     exportAssignJury,
     exportCsv,
     exportmergedData,
     exportRegData,
     exportreportCsv,
     fetchcustomAllocation,
     fetchFormFields,
     fetchJuryGroupFields,
     generalSettingsget,
     generalSettingsUpdate,
     getAdminPaymentGateList,
     getAllgroup,
     getAssignJuryById,
     getBackdoor,
     getCoupon,
     getDatatoShortlist,
     getEntryDataById,
     getEntryFormByEventId,
     getEventsController,
     getjudgeById,
     getMergedData,
     getProgressJury,
     getRegistrationFormByEventId,
     getRegnData,
     getRegnDataById,
     getScorecardform,
     getShortlist,
     handleShortlistData,
     juryAssignGet,
     juryAssignUpdate,
     loginseller,
     MyEventget,
     MyEventsget,
     NewPassword,
     registrationDataEdit,
     Roudget,
     scorecardsGet,
     SearchEvent,
     sendmailMultiple,
     sendOTP,
     sheet,
     SubmissionFormatCreate,
     submitEntryData,
     submitRegistrationData,
     updateCoupon,
     updateEntryForm,
     updateforgetPassword,
     updateProfile,
     updateRegistrationForm,
     updateScorecardForm,
     usercreate,
     UserFormCategoryList,
     verifyOTPHandler,
     visiblePublicly
} from '../controller/adminController.js'
import {
     validateAdmin,
     validateAdminLogin,
     validateotp,
     validateAwardCreate,
     validateNewPass,
     validateVerifyOtp,
     validateupdateForgetPassword,
     validateAwardCategoryUpdate,
     validateUpdateEventCreate,
     validateUpdateEventSocial,
     ValidateSubmissionIDformat,
     ValidateAwardDirectory,
     ValidategeneralSettings,
     ValidateAssignJuryCreate,
     ValidateCouponCreate,
     validatefilterCategory,
     validateRegistartionForm,
     validateRegistartionFormGet,
     validateRegistartionFormUpdate,
     validateEntryForm,
     validateEntryFormGet,
     validateEntryFormUpdate,
     ValidateEventStatus,
     validategenSettingGet,
     validategenSettingUpdate,
     validateScorecardFormUpdate,
     validateScoreForm,
     validateAssignjuryGet,
     validateassignJuryupdate,
     validatebulkmailSchema,
     validatejuryDataDownload,
     validateRegistartionSubmission,
     validateEntrySubmission,
     validateShortlist,
     validateCustomAllocation,
     validateRegistrationData,
     validateUpdateEntryData,
     validateGetShortlist
} from '../validation/AdminValidation.js'
import authenticate from '../middleware/authentication.js'
import upload from '../middleware/multer.js'
import { getDraftEntry } from "../service/adminService.js"

const router = express.Router()

router.get('/SearchEvent', SearchEvent)
       
//------------------------------------------ admin login ----------------------------------------------//

router.post('/register', validateAdmin, usercreate)//* --------  DONE

router.post('/login', validateAdminLogin, loginseller)//* --------  DONE

router.post('/profileUpdate', authenticate, upload.single('profile_image'), updateProfile)//* ------  DONE

router.post('/send_otp', validateotp, sendOTP)//* --------  DONE

router.post('/verifyOtp', validateVerifyOtp, verifyOTPHandler)//* --------  DONE

router.post('/updateForgetPassword', validateupdateForgetPassword, updateforgetPassword)//* --------  DONE

//------------------------------------------ profile Update ----------------------------------------------//

router.get('/getprofile', authenticate, AdminProfileget)//* --------  DONE

router.get('/allAwards', authenticate, validatefilterCategory, Awardsget)//* --------  DONE

router.get('/userformcategorylist',authenticate,UserFormCategoryList)

router.post('/newPassword', authenticate, validateNewPass, NewPassword)//* --------  DONE

//--------------------------------------- dashboard events ----------------------------------------------//

router.get('/dashboardEvents', authenticate, dashboardEvents)//* --------  DONE

router.get('/MyEvents', authenticate, MyEventsget)//* --------  DONE

//----------------------------------------- Create Event ----------------------------------------------//

router.post('/createEvent', authenticate, upload.fields([{ name: 'event_logo', maxCount: 1 }, { name: 'event_banner', maxCount: 1 }]), eventCreate)//& validation pending 
//* --------  DONE

router.post('/awardCategory', authenticate, validateAwardCreate, awardCreate)//* --------  DONE

router.get('/allAwards', authenticate, validatefilterCategory, Awardsget)//* --------  DONE 

router.get('/download', authenticate, exportCsv)//* --------  DONE

router.post('/updateAwardCategory', authenticate, validateAwardCategoryUpdate, awardUpdate)//* --------  DONE 

router.delete('/awards/:id', authenticate, deleteAward)//* --------  DONE

router.get('/awardget/:awardId', authenticate, AwardByIdget)//* --------  DONE 

//----------------------------------------- Update Event ----------------------------------------------//

router.get('/getEvent/:eventId', authenticate, MyEventget)//* --------  DONE  

router.post('/updateCreateEvent', authenticate, validateUpdateEventCreate, eventUpdate)//* --------  DONE  

router.post('/updateEventSocial', authenticate, upload.fields([{ name: 'event_logo' }, { name: 'event_banner' }, { name: 'social_image' }]), validateUpdateEventSocial, eventupdateSocial)//* --------  DONE  

router.post('/submissionIDformat', authenticate, ValidateSubmissionIDformat, SubmissionFormatCreate)//* --------  DONE  

router.post('/awardDirectory', authenticate, ValidateAwardDirectory, visiblePublicly)//* --------  DONE

router.post('/couponCreate', authenticate, ValidateCouponCreate, CreateCoupon)//* --------  DONE 

router.get("/getCoupon/:eventId",authenticate, getCoupon);

//--------------------------------------- draft to live or archive -----------------------------------------//

router.post('/eventStatus', authenticate, ValidateEventStatus, EventStatus)//* --------  DONE 

//----------------------------------------- create round ----------------------------------------------//

router.post('/generalSettings', authenticate, ValidategeneralSettings, CreateGeneralSettings)//* --------  DONE 

router.get('/listOfRounds', authenticate, validategenSettingGet, generalSettingsget)//* --------  DONE  

router.post('/updateGenSettings', authenticate, validategenSettingUpdate, generalSettingsUpdate)//* --------  DONE  

router.get('/roundget', authenticate, Roudget)//* --------  DONE 

//----------------------------------------- ScoreCard Create ----------------------------------------------//

router.post('/scorecard', authenticate, validateScoreForm, createScoreForm1)//* --------  DONE 

router.post('/scorecard1', authenticate, validateScoreForm, createScoreForm1)//* --------  DONE 

router.get('/scorecard', authenticate, getScorecardform)//* --------  DONE 

router.put('/scorecard', authenticate, validateScorecardFormUpdate, updateScorecardForm)//* --------  DONE 

router.get('/allScorecard', authenticate, scorecardsGet)//* --------  DONE 

router.delete('/scorecard', authenticate, deleteScorecard)//* --------  DONE 

//--------------------------------------- Assign Jury  --------------------------------------------//

router.post('/assignJury', authenticate, ValidateAssignJuryCreate, AssignJuryCreate)//* --------  DONE 
// ! but juryGrouplist pending

router.get('/assignJury', authenticate, validateAssignjuryGet, getAssignJuryById)//* --------  DONE 

router.put('/assignJury', authenticate, validateassignJuryupdate, juryAssignUpdate)//* --------  DONE 

router.delete('/assignJury', authenticate, deletejuryAssign)//* --------  DONE 

router.get("/allAssignJury", authenticate, juryAssignGet)//* --------  DONE 

//------------------------------------------------ dynamic forms -----------------------------------------------//

// Registration Form Routes 

router.post('/registrationForm', authenticate, validateRegistartionForm, createRegistrationForm)//* --------  DONE 

router.get('/registrationForm', authenticate, validateRegistartionFormGet, getRegistrationFormByEventId)//* --------  DONE 

router.put('/registrationFormUp', authenticate, validateRegistartionFormUpdate, updateRegistrationForm)//* --------  DONE 

//------------------------------------------------ registrationData Fill up -----------------------------------------------//

router.post('/registrationForm_submission', authenticate, validateRegistartionSubmission, submitRegistrationData)//* --------  DONE 

router.get('/registrationData', authenticate, getRegnData)//* --------  DONE 

router.get("/downloadRegistartionData", exportRegData)//* --------  DONE 

router.put('/registrationDataEdit', authenticate, validateRegistrationData, registrationDataEdit)//& ok Tested 

router.get('/registrationDataById', authenticate, getRegnDataById)

// Entry Form Routes

router.post('/entryForm', authenticate, validateEntryForm, createEntryForm)//* --------  DONE 

router.get('/entryForm', authenticate, validateEntryFormGet, getEntryFormByEventId)//* --------  DONE 

router.put('/entryForm', authenticate, validateEntryFormUpdate, updateEntryForm)//* --------  DONE 

router.get('/entryDataById', authenticate, getEntryDataById)

//------------------------------------------------ entryData Fill up -----------------------------------------------//

router.post('/entryForm_submission', authenticate, validateEntrySubmission, submitEntryData)//* --------  DONE 

router.get('/entrantsData', authenticate, getMergedData)//* --------  DONE 

router.put('/entryDataEdit', authenticate, validateUpdateEntryData, entryDataEdit)


//----------------------------------- Backdoor Link  --------------------------------------//

router.get('/createBackdoor', authenticate, EventgetUser)//* --------  DONE 

router.get('/getBackdoor', authenticate, getBackdoor)//& ok Tested

router.delete('/deleteBackdoor', authenticate, backdoorDelete)//& ok Tested 

//----------------------------------- multiple mail invitation  --------------------------------------//

router.post('/send-bulk-emails', authenticate, validatebulkmailSchema, sendmailMultiple)//* --------  DONE 

router.get('/AssignJuryData', authenticate, validatejuryDataDownload, exportAssignJury)//* --------  DONE 



//------------------------------------------ Shortlist Entries  --------------------------------------//

router.get("/getDatatoShortlist", authenticate, getDatatoShortlist)//* --------  DONE 

router.post("/shortlist", authenticate, validateShortlist, handleShortlistData)//* --------  DONE 

router.get("/getShortlist", authenticate, validateGetShortlist,getShortlist)//* --------  DONE 

router.delete("/deleteShortlist", authenticate, deleteShortlist)//& ok Tested 


//------------------------------------------ Custom Allocation (Abstain/Non-Abstain)  --------------------------------------//

router.post("/customAllocation", authenticate, validateCustomAllocation, customAllocate)//* --------  DONE 

router.get('/getCustomAllocation', authenticate, fetchcustomAllocation)//* --------  DONE 

router.get("/downloadentrant", exportmergedData)//^Doing need testing 

router.get('/exportcsv', exportreportCsv)//^Doing need testing 

router.get('/fetchFormFields', authenticate, fetchFormFields)//* --------  DONE 

//------------------------------------------ Jury Group Create  --------------------------------------//

router.post('/create-group', authenticate, fetchJuryGroupFields)

router.get('/getaljudge', authenticate, getAllgroup)

router.get('/getjudgebyId', authenticate, getjudgeById)

router.delete('/deletegroup', authenticate, deleteJuryGroup)


//------------------------------------------ Filter report download long   --------------------------------------//
router.post("/filterReport", ExchelJuryScoreReport);

router.post("/download", authenticate, exportreportCsv);


router.post("/download1", authenticate, ExhelEntrydata);

router.get("/eventsdata", authenticate, getEventsController)

//------------------------------------------ Filter report download long   --------------------------------------//

router.get("/getalladmin", authenticate, Adminsget)

router.post("/blockadmin", blockAdmin)

//------------------------------------------ jury overview page     --------------------------------------//

router.get("/juryProgress", authenticate, getProgressJury)

router.get('/couponGet',  couponGet)  

router.delete('/coupon/:couponId',authenticate,deleteCoupon);

router.put('/coupon/:couponId',authenticate, updateCoupon);

router.get('/getpaymentlistbyeventid',authenticate, getAdminPaymentGateList)

router.post('/topFilterReport', sheet)


//----------------------------------------------DRAFT APIM  ---------///


router.get('/getentry',authenticate,getDraftEntry)


export default router;
// =======
// import express from "express"
// import { AdminProfileget, AssignJuryCreate, AwardByIdget, awardCreate, Awardsget, awardUpdate, CreateCoupon, CreateGeneralSettings, CriteriaSettingCreate, CriteriaSettingUpdate, dashboardEvents, deleteAward, deleteGroupCriteria, deleteJuryGroup, deleteScoreCard, EventArchive, eventCreate, EventLive, eventUpdate, eventupdateSocial, exportCsv, GetEmailForVerify, juryGroupCreate, JuryGroupGet, juryGroupUpdate, JuryNameget, loginseller, MyEventget, MyEventsget, NewPassword, ScorecardCreate, Scorecardget, ScorecardUpdate, sendOTP, SubmissionFormatCreate, updateforgetPassword, updateProfile, usercreate, verifyOTPHandler, visiblePublicly } from '../controller/adminController.js'
// import { validateAdmin, validateAdminLogin, validateotp, validateEventCreate, validateAwardCreate, validateNewPass, validateVerifyOtp, validateAdminUpdateProfile, validateupdateForgetPassword, validateAwardCategoryUpdate, validateUpdateEventCreate, validateUpdateEventSocial, ValidateSubmissionIDformat, ValidateAwardDirectory, ValidategeneralSettings, ValidateEventLive, ValidateEventArchive, ValidateScoreCardCriteria, ValidateJuryGroupCreate, ValidateAssignJuryCreate, ValidateScoreCardUpdate, ValidateCriteriaSettingsCreate, ValidateCriteriaSettingUpdate, ValidateJuryGroupUpdate, ValidateCouponCreate, validatefilterCategory } from '../validation/AdminValidation.js'
// import authenticate from '../middleware/authentication.js'
// import upload from '../middleware/multer.js'

// const router = express.Router()

// //------------------------------------------ admin login ----------------------------------------------//

// router.post('/register', validateAdmin, usercreate)//* --------  DONE

// router.post('/login', validateAdminLogin, loginseller)//* --------  DONE

// router.post('/profileUpdate', authenticate, upload.single('profile_image'), updateProfile)//!-----------   to be done today 

// router.post('/send_otp', validateotp, sendOTP)//* --------  DONE

// router.post('/verifyOtp', validateVerifyOtp, verifyOTPHandler)//* --------  DONE

// router.post('/updateForgetPassword', validateupdateForgetPassword, updateforgetPassword)//* --------  DONE

// router.get('/getEmail/:otpId', GetEmailForVerify)//~ -----delete this not used 

// //------------------------------------------ profile Update ----------------------------------------------//

// router.get('/getprofile', authenticate, AdminProfileget)//* --------  DONE

// router.get('/allAwards', authenticate,validatefilterCategory, Awardsget)//&--------- getting implemeted to the frontend

// router.post('/newPassword', authenticate, validateNewPass, NewPassword)//* --------  DONE

// //----------------------------------------- dashboard events ----------------------------------------------//

// router.get('/dashboardEvents', authenticate, dashboardEvents)//* --------  DONE

// router.get('/MyEvents', authenticate, MyEventsget)//* --------  DONE

// //----------------------------------------- Create Event ----------------------------------------------//

// router.post('/createEvent', authenticate, upload.fields([{ name: 'event_logo', maxCount: 1 }, { name: 'event_banner', maxCount: 1 }]), eventCreate)//* --------  DONE

// router.post('/awardCategory', authenticate, validateAwardCreate, awardCreate)//* --------  DONE

// router.get('/allAwards', authenticate, validatefilterCategory, Awardsget)//* --------  DONE 

// router.get('/download', authenticate, exportCsv)//* --------  DONE

// router.post('/updateAwardCategory', authenticate, validateAwardCategoryUpdate, awardUpdate)//* --------  DONE 

// router.delete('/awards/:id', authenticate, deleteAward)//* --------  DONE

// router.get('/awardget/:awardId', authenticate, AwardByIdget)//* --------  DONE 

// //----------------------------------------- Update Event ----------------------------------------------//

// router.get('/getEvent/:event_id', authenticate, MyEventget)//^-------------Second modal 

// router.post('/updateCreateEvent', authenticate, validateUpdateEventCreate, eventUpdate)//^-------------Second modal 

// router.post('/updateEventSocial', authenticate, upload.fields([{ name: 'event_logo' }, { name: 'event_banner' }, { name: 'social_image' }]), validateUpdateEventSocial, eventupdateSocial)

// router.post('/submissionIDformat', authenticate, ValidateSubmissionIDformat, SubmissionFormatCreate)

// router.post('/awardDirectory', authenticate, ValidateAwardDirectory, visiblePublicly)

// router.post('/couponCreate', authenticate, ValidateCouponCreate, CreateCoupon)

// //----------------------------------------- Manage Jury ----------------------------------------------//

// router.post('/generalSettings', authenticate, ValidategeneralSettings, CreateGeneralSettings)



// //----------------------------------------- draft to live or archive ----------------------------------------------//

// router.post('/toLive', authenticate, ValidateEventLive, EventLive)

// router.post('/toArchive', authenticate, ValidateEventArchive, EventArchive)

// //----------------------------------------- ScoreCard Create ----------------------------------------------//

// router.post('/scorecardCreate', authenticate, ValidateScoreCardCriteria, ScorecardCreate)

// router.post('/criteriaSettingCreate', authenticate, ValidateCriteriaSettingsCreate, CriteriaSettingCreate)

// router.post('/settingsUpdate', authenticate, ValidateCriteriaSettingUpdate, CriteriaSettingUpdate)

// router.get('/getScorecard', authenticate, Scorecardget)

// router.post('/scoreCardUpdate', authenticate, ValidateScoreCardUpdate, ScorecardUpdate)

// router.delete('/deleteScoreCard/:id', authenticate, deleteScoreCard)


// //----------------------------------------- Jury group Create ----------------------------------------------//

// router.post('/assignJury', authenticate, ValidateAssignJuryCreate, AssignJuryCreate)

// router.get('/getJuryName', authenticate, JuryNameget)

// router.post('/juryGroupCreate', authenticate, ValidateJuryGroupCreate, juryGroupCreate)

// router.post('/juryGroupUpdate', authenticate, ValidateJuryGroupUpdate, juryGroupUpdate)

// router.delete('/deleteJuryGroup/:id', authenticate, deleteJuryGroup)

// router.get('/getJuryGroups', authenticate, JuryGroupGet)

// router.delete('/JuryCriteriaDelete/:id', authenticate, deleteGroupCriteria)

// export default router
