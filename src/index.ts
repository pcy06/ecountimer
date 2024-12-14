import EcountXor from "./utils/encryption/EcountXor";
import superagent from "superagent";
import { configDotenv } from "dotenv";

configDotenv();

const COM_CODE = process.env.COM_CODE as string;
const USERNAME = process.env.USERNAME as string;
const PASSWORD = process.env.PASSWORD as string;
const PASSWORD_XOR_KEY = Date.now().toString().substring(0, 7);

const loginPayload = {
  com_code: COM_CODE,
  id: USERNAME,
  spasswd: `${PASSWORD_XOR_KEY.length}${PASSWORD_XOR_KEY}${EcountXor.encrypt(PASSWORD, PASSWORD_XOR_KEY)}`,
  lan_type: "ko-KR",
  process_ing: "N",
  zone: "AC",
  db_shard_no: "1",
  domain: ".ecount.com",
  m_flag: "N",
  yn_pwdskip: "N",
  login_type: "0",
  access_site: "ECOUNT",
  adminChecked: "N",
  secondApproval: "N",
  sip: "",
  platformVersion: "15"
}

const agent = superagent.agent();

async function login() {
  const loginResult = await agent.post(
    "https://loginac.ecount.com/ECERP/LOGIN/ERPLoginExecute",
  )
    .set("User-Agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36")
    .send(loginPayload)

  const redirection = loginResult.redirects.find(url => url.includes('ECP050M?w_flag=1&ec_req_sid'));

  if (!redirection) {
    throw new Error("Ecount ERP Login Failure");
  }

  const url = new URL(redirection);
  const ec_req_sid = url.searchParams.get('ec_req_sid');

  if (!ec_req_sid) {
    throw new Error("ec_req_sid not found (possible login failure)");
  }

  const query = {
    Request: {
      Data: {
        FORM_GUBUN: "PO270",
        FORM_TYPE: "PO270",
        FORM_SEQ: "1000",
        PAGE_CURRENT: 1,
        BASE_DATE_FROM: "20241211",
        BASE_DATE_TO: "20241211",
        MENU_SEQ: 2457,
        PRG_ID: "E020722",
        useSignBox: true,
        SAL_TYPE_CD: "P",
        EMP_CD: "00019",
        SITE_LEVEL_GROUP_CHK: "1",
        CLOCK_IN_OUT_TYPE: "A",
        WORKING_HOLIDAY: "A",
        TENURE: "0",
        OTHER: "N",
        IsFromZaOnly: true,
        PAGE_SIZE: 5000,
        TabCd: "A1"
      }
    }
  }

  const res = await agent.post(
    `https://loginac.ecount.com/ECAPI/SVC/Manage/TimeMgmt/GetListClockInOutEmployeeForReport?ec_req_sid=${ec_req_sid}`,
  )
    .send(query)
    .set("User-Agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36");

  console.log(res.text);
}

login();