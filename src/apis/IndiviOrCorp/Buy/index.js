import axios from "axios";

const postPaxDetails = async (
  name,
  email,
  dob,
  contactno,
  nationality,
  occupation,
  residentstatus,
  address,
  bldg,
  street,
  city,
  state,
  country,
  pan_number,
  pan_name,
  pan_relation,
  uin,
  paidpan_number,
  paidby_name,
  loan_amount,
  declared_amount,
  gst_number,
  gst_state,
  istouroperator,
  isproprietorship,
  isnri,
  isitr,
  p_number,
  p_issuedat,
  p_issued_date,
  p_expiry,
  otherid_type,
  otherid_number,
  otherid_expiry,
  istcsexemption,
  exemption_remarks
) => {
  const token = localStorage.getItem("token");
  try {
    const response = await axios.post(
      `http://localhost:5001/api/nav/PaxCreate`,
      {
        name: name,
        email: email,
        dob: dob,
        contactno: contactno,
        nationality: nationality,
        occupation: occupation,
        residentstatus: residentstatus,
        address: address,
        bldg: bldg,
        street: street,
        city: city,
        state: state,
        country: country,
        pan_number: pan_number,
        pan_name: pan_name,
        pan_relation: pan_relation,
        uin: uin,
        paidpan_number: paidpan_number,
        paidby_name: paidby_name,
        loan_amount: loan_amount,
        declared_amount: declared_amount,
        gst_number: gst_number,
        gst_state: gst_state,
        istouroperator: istouroperator,
        isproprietorship: isproprietorship,
        isnri: isnri,
        isitr: isitr,
        p_number: p_number,
        p_issuedat: p_issuedat,
        p_issued_date: p_issued_date,
        p_expiry: p_expiry,
        otherid_type: otherid_type,
        otherid_number: otherid_number,
        otherid_expiry: otherid_expiry,
        istcsexemption: istcsexemption,
        exemption_remarks: exemption_remarks,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    console.log(error);
  }
};

const PaxDetailsID = async () => {
  const token = localStorage.getItem("token");
  try {
    const response = await axios.get(
      `http://localhost:5001/api/nav/PaxDataID`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    console.log(error);
  }
};

const PaxDetailsFull = async (paxid) => {
  const token = localStorage.getItem("token");
  try {
    const response = await axios.post(
      `http://localhost:5001/api/nav/PaxDataFull`,
      {
        paxid: paxid,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    console.log(error);
  }
};

const PaxDetailsFullMain = async () => {
  const token = localStorage.getItem("token");
  try {
    const response = await axios.get(
      `http://localhost:5001/api/nav/PaxDataFullMain`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    console.log(error);
  }
};

export { postPaxDetails, PaxDetailsID, PaxDetailsFull, PaxDetailsFullMain };
