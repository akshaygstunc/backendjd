export const getMergedData = async (req, res) => {
    const { eventId, search, limit, skip } = req.query;

    const eventIdCheck = await checkeventId(eventId);
    if (!eventIdCheck) {
        return res.status(400).json({
            status: resposne.successFalse,
            message: resposne.eventIdfail,
        });
    }
    const searchTerm = search?.trim() || null;
    ``
    const limitValue = parseInt(limit, 10) > 0 ? parseInt(limit, 10) : 10;
    const skipValue = parseInt(skip, 10) >= 0 ? parseInt(skip, 10) : 0;

    try {
        const entryFields = await entryFieldsFetch(eventId);
        const registrationFields = await registrationFieldsFetch(eventId);

        const entrySubmissions = await entryDataFetch(eventId, searchTerm, limitValue, skipValue);

        const registrationSubmissions = await registrationDataFetch(eventId);

        const adminDetails = await adminData(req.user.id, req.user.role);
        if (!entryFields.data.length && !registrationFields.data.length) {
            return res.status(400).json({
                status: resposne.successFalse,
                message: "No form schema available"
            });
        }
        const groupedSubmissions = {};
        entrySubmissions.forEach((item) => {
            const key = `${item.created_by}-${item.role}`;
            if (!groupedSubmissions[key]) {
                groupedSubmissions[key] = { created_by: item.created_by, role: item.role, submissions: [] };
            }
            groupedSubmissions[key].submissions.push(item);
        });
        registrationSubmissions.forEach((registration) => {
            const key = `${registration.created_by}-${registration.role}`;
            if (!groupedSubmissions[key]) {
                groupedSubmissions[key] = { created_by: registration.created_by, role: registration.role, submissions: [] };
            }
            groupedSubmissions[key].registrationData = registration;
        });
        const mergedData = [];
    
        if (groupedSubmissions) {
          Object.keys(groupedSubmissions).forEach((key) => {
            const group = groupedSubmissions[key];
            mergedData.push({
              registrationData: group.registrationData || adminDetails,
              submissions: group.submissions,
            });
          });
        }
        const totalCount = entrySubmissions.length
    
        return res.status(200).json({
          status: resposne.successTrue,
          message: resposne.fetchSuccess,
          data: {
            formSchema: {   registrationFields: registrationFields.data,
                entryFields: entryFields.data,
              },
              mergedData,
            },  totalCount
        });
    
      } catch (error) {
        return res.status(400).json({
          status: resposne.successFalse, message: error.message
        });
      }
    };