import { Context, APIGatewayEvent } from "aws-lambda";
import * as uuid from "uuid";

import handler, {
  isArrayEmpty,
  isObjectEmpty,
  ResponseError,
  throwNotFoundError,
} from "../../../libs/handler-lib";
import dynamoDb from "../../../libs/dynamodb-lib";
import { sortCommentsByDate } from "../../../libs/helper-lib";
import { Comment } from "src/interfaces/Comment";
import { ResponseStatus } from "src/interfaces/ResponseStatus";

const ERROR_TEXTS = {
  COMMENTS: {
    notFound: "Comments are not found.",
  },
  COMMENT: {
    notFound: "Comment is not found.",
    unknownUser: "Unknown user",
  },
};

export const getCommentByUser = handler(async function (
  event: APIGatewayEvent,
  context: Context
): Promise<Comment[]> {
  const userId = event.pathParameters.userId;

  const postParams = {
    TableName: process.env.COMMENT_TABLENAME,
    IndexName: "userId-index",
    KeyConditionExpression: "#userId = :id",
    ExpressionAttributeNames: {
      "#userId": "userId",
    },
    ExpressionAttributeValues: {
      ":id": userId,
    },
  };

  const result = (await dynamoDb.query(postParams))?.Items;

  if (isArrayEmpty(result)) {
    throwNotFoundError(ERROR_TEXTS.COMMENT.notFound);
  }

  return result as Comment[];
});

//Should work well!
export const getOneComment = handler(async function (
  event: APIGatewayEvent,
  context: Context
): Promise<Comment> {
  const commentId = event.pathParameters.commentId;

  const params = {
    TableName: process.env.COMMENT_TABLENAME,
    Key: {
      commentId,
    },
  };

  const result = (await dynamoDb.get(params))?.Item || {};

  if (isObjectEmpty(result)) {
    throwNotFoundError(ERROR_TEXTS.COMMENT.notFound);
  }

  return result as Comment;
});

const STATUS = {
  unknownUser: 400,
  problemsPutItem: 400,
};

// const DEFAULT_COMMENT_ID = "userId-03";

export const createComment = handler(async function (
  event: APIGatewayEvent,
  context: Context
): Promise<Comment> {
  // to demonstrate a work flow without UserId ( we set the default Id)
  //   const userId =
  //     event.requestContext.identity.cognitoIdentityId || DEFAULT_COMMENT_ID;

  //   if (!userId) {
  //     throw new ResponseError(
  //       ERROR_TEXTS.COMMENT.unknownUser.concat(JSON.stringify(event.requestContext)),
  //       STATUS.unknownUser
  //     );
  //   }

  const data = JSON.parse(event.body) || {};

  const { text, userId, postId } = data;

  const newPost: Comment = {
    createdAt: new Date().toISOString(),
    postId,
    text,
    commentId: uuid.v1(),
    userId,
  };
  const params = {
    TableName: process.env.COMMENT_TABLENAME,
    Item: newPost,
  };

  try {
    await dynamoDb.put(params);
  } catch (error) {
    throw new ResponseError(
      `Put Item to db issue: ${error.message}`,
      STATUS.problemsPutItem
    );
  }

  return params.Item;
});

export const deleteComment = handler(async function (
  event: APIGatewayEvent,
  context: Context
): Promise<ResponseStatus> {
  const commentId = event.pathParameters.commentId;

  const params = {
    TableName: process.env.COMMENT_TABLENAME,
    Key: {
      commentId,
    },
    ReturnValues: "ALL_OLD",
  };

  const handleDeleteItemError = (err, data) => {
    if (err) {
      throw new ResponseError(
        `Unable to delete item. Error JSON: ${JSON.stringify(err, null, 2)}`,
        405
      );
    }
  };

  const result = await dynamoDb.delete(params, handleDeleteItemError);
  const deletedComment: Comment = result.Attributes as Comment;

  if (!deletedComment) {
    throw new ResponseError(ERROR_TEXTS.COMMENT.notFound, 404);
  }

  return { status: true };
});

export const getAllComments = handler(async function (
  event: APIGatewayEvent,
  context: Context
): Promise<Comment[]> {
  const { descending = false, sort } = event.queryStringParameters || {};

  const params = {
    TableName: process.env.COMMENT_TABLENAME,
  };

  const comments = (await dynamoDb.scanAll(params)) || [];

  if (isArrayEmpty(comments)) {
    throwNotFoundError(ERROR_TEXTS.COMMENT.notFound);
  }

  let sortedComments = [...comments];

  if (sort === "date") {
    sortedComments = sortCommentsByDate(comments, !!descending);
  }

  return sortedComments as Comment[];
});

export const updateComment = handler(async function (
  event: APIGatewayEvent,
  context: Context
): Promise<Comment> {
  const commentId = event.pathParameters.commentId;
  const data = JSON.parse(event.body);

  const params = {
    TableName: process.env.COMMENT_TABLENAME,
    Key: {
      commentId,
    },
    UpdateExpression: "SET #text = :text",
    ExpressionAttributeValues: {
      ":text": data.text,
    },
    ExpressionAttributeNames: {
      "#text": "text",
    },
    ReturnValues: "UPDATED_NEW",
  };

  return ((await dynamoDb.update(params)) as unknown) as Comment;
});
