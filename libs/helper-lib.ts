import { APIGatewayEvent } from "aws-lambda";

import { Post } from "src/interfaces/Post";
import { Comment } from "src/interfaces/Comment";

/**
 * Sort array of Posts by Date in the descending and ascending ways.
 * @param arr - array of Posts.
 * @param isDescending - boolean value for specify sorting way. Default way = ascending
 */
export const sortPostsByDate = (arr: Post[], isDescending: boolean): Post[] => {
  return arr.sort((a, b) => {
    if (!isDescending) {
      return a.createdAt > b.createdAt ? -1 : a.createdAt < b.createdAt ? 1 : 0;
    }

    return a.createdAt < b.createdAt ? -1 : a.createdAt > b.createdAt ? 1 : 0;
  });
};

/**
 * Parse data from a request's body.
 * @param event - request event.
 */
export const getDataFromEvent = (event: APIGatewayEvent) => {
  return JSON.parse(event.body) || {};
};

/**
 * Parse data from a request's body.
 * @param str - any string.
 * @returns - boolean value, default = false
 */
export const getBooleanFromString = (str: string): boolean => {
  return str === "true" ? true : false;
};

/**
 * Paginate array of items by limit and page numbers
 * @param items - array of items
 * @param limit - limit of items' number
 * @param page - number of page
 */
export const paginateItems = (items: any[], limit: number, page: number) => {
  if (limit) {
    let paginatedItems = [...items];

    if (page) {
      const startFrom = (page - 1) * limit;

      paginatedItems = paginatedItems.slice(startFrom, startFrom + limit);
    } else {
      paginatedItems.splice(limit);
    }

    return paginatedItems;
  }

  return items;
};

export const sortCommentsByDate = (arr: Comment[], isDescending: boolean) => {
  return arr.sort((a, b) => {
    if (isDescending) {
      return a.createdAt > b.createdAt ? -1 : a.createdAt < b.createdAt ? 1 : 0;
    }

    return a.createdAt < b.createdAt ? -1 : a.createdAt > b.createdAt ? 1 : 0;
  });
};
