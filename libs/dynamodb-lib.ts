import { DynamoDB } from "aws-sdk";

const client = new DynamoDB.DocumentClient();

export default {
  get: (params, err = null) => client.get(params, (err = null)).promise(),
  put: (params, err = null) => client.put(params, (err = null)).promise(),
  query: (params, err = null) => client.query(params, (err = null)).promise(),
  update: (params, err = null) => client.update(params, (err = null)).promise(),
  delete: (params, err = null) => client.delete(params, (err = null)).promise(),
  scan: (params, onScan) => client.scan(params, onScan),
  scanAll: async (params): Promise<any[]> => {
    const newParams = { ...params };

    return await new Promise((resolve, reject) => {
      function onScan() {
        client.scan(newParams, (err, data) => {
          if (err) {
            reject(err);
          } else {
            let items = data.Items;

            if (typeof data.LastEvaluatedKey != "undefined") {
              newParams.ExclusiveStartKey = data.LastEvaluatedKey;
              items = items.concat(client.scan(newParams, onScan));
            }

            resolve(items);
          }
        });
      }

      onScan();
    });
  },
  batchGet: (params) => client.batchGet(params).promise(),
};
