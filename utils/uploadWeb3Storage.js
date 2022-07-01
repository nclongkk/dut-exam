const { Web3Storage } = require("web3.storage");
const { File } = require("web3.storage");

const getAccessToken = () => {
  return process.env.WEB3STORAGE_TOKEN;
};

const makeStorageClient = () => {
  return new Web3Storage({ token: getAccessToken() });
};

exports.storeFiles = async (obj) => {
  const file = makeFileObjects(obj);
  const client = makeStorageClient();
  const result = await client.put(file);
  return result;
};

exports.formartDataToSave = (examResult) => {
  return {
    examResultId: examResult._id,
    userId: examResult.student._id,
    userEmail: examResult.student.email,
    score: examResult.score,
    class: examResult.exam.class.name,
    examName: examResult.exam.name,
  };
};

function makeFileObjects(obj) {
  const buffer = Buffer.from(JSON.stringify(obj));

  const files = [
    new File(["contents-of-file-1"], "plain-utf8.txt"),
    new File([buffer], "hello.json"),
  ];
  return files;
}
