const axios = require('axios');

const TOPIC_RES_LIMIT = 250;

const NodeCache = require('node-cache');
const forumCache = new NodeCache({stdTTL: 0});

const addTopic = async (name, user) => {
    if (user.organization){
        const parentTopicResponse = await createTopicIfDoesNotExist(user.organization, user);
        if(!parentTopicResponse) {
            throw new Error("Error creating/fetching parent topic");
        }
        parentId = parentTopicResponse.data._id;
        topicResponse = await createTopic(name, parentId, user);
    } else {
        topicResponse = await createTopic(name, null, user)
    }
    //invalidate cache
    forumCache.del(forumCache.keys());
    return topicResponse.data;
}

const addComment = async (topicId, comment, user) => {
    var config = require('config');
    const forumApiConfig = config.get("forumApi");

    const options = {
        withCredentials: true,
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${user.jwt}`
        }
    };

    // console.log("dataUpload.topic_id: " + dataUpload.topic_id);
    const url = forumApiConfig.baseUrl + "/comment/" + topicId;
    const requestBody = { comment: comment};
    return await axios.post(url, requestBody, options);
}

const getComments = async (topic_id, user) => {
    let config = require('config');
    const forumApiConfig = config.get("forumApi");

    const jwt = user.jwt;
    const options = {
        withCredentials: true,
        headers: {
            'Authorization': `Bearer ${jwt}`
        }
    };

    const url = forumApiConfig.baseUrl + "/comment/" + topic_id;
    const response = await axios.get(url, options);

    return response.data.map(item => {
        return {
            _id: item._id,
            create_ts: item.created_ts,
            comment: item.comment,
            author_user: item.author_user
        };
    });
}

const getAllComments = async (user, afterDate) => {
    let config = require('config');
    const forumApiConfig = config.get("forumApi");

    const jwt = user.jwt;
    const options = {
        withCredentials: true,
        headers: {
            'Authorization': `Bearer ${jwt}`
        }
    };

    let url = forumApiConfig.baseUrl + "/comment";

    if (afterDate){
        let d = afterDate.toISOString();
        
        url += "?createdAfter=" + d
    }

    const response = await axios.get(url, options);

    return response.data;
}

const getTopic = async (user, name) => {
    let config = require('config');
    const forumApiConfig = config.get("forumApi");

    const jwt = user.jwt;
    const options = {
        withCredentials: true,
        headers: {
            'Authorization': `Bearer ${jwt}`
        }
    };

    const url = `${forumApiConfig.baseUrl}/?name=${name}`;
    return await axios.get(url, options);
}

const getVersion = async (user) => {
    let config = require('config');
    const forumApiConfig = config.get("forumApi");

    let baseUrl = forumApiConfig.baseUrl.substring(0, forumApiConfig.baseUrl.lastIndexOf("/"))

    const url = `${baseUrl}/version`;
    return await axios.get(url);
}

const filterResults = function(results, query){
  let res = results;
  if (typeof(query) === "object"){
    delete query.limit;
    delete query.page;
    let keys = Object.keys(query);
    for (let i=0; i<keys.length; i++){
      res.data = res.data.filter(t => {
        return t[keys[i]] && t[keys[i]] === query[keys[i]];
      })
    }
  }
  return res;
}

const getTopics = async (user, query) => {
    let config = require('config');
    const forumApiConfig = config.get("forumApi");

    if (user && forumCache.has('forum-'+user.id)){
      const cacheRes = forumCache.get('forum-'+user.id);
      if (cacheRes.data.length > 0){
        const cacheFetching = forumCache.has('forumFetching-'+user.id) && forumCache.get('forumFetching-'+user.id);
        if (!cacheFetching){
          forumCache.set('forumFetching-'+user.id, true);
          getTopicsNoCache(user, query);
        }
        return filterResults(cacheRes, query);
      }
    }

    const jwt = user.jwt;
    const options = {
        withCredentials: true,
        headers: {
            'Authorization': `Bearer ${jwt}`
        }
    };

    let url = forumApiConfig.baseUrl;

    let queryKeys = [];
    query.limit=TOPIC_RES_LIMIT;

    try{
        let results = {data: []};
        let x = await axios.get(url, options);
        results.data = results.data.concat(x.data);
        let page = 1;
        while (x.data.length >= TOPIC_RES_LIMIT){
            let urlAdd = (queryKeys.length > 0) ? "&" : "?";
            urlAdd += "page=" + page;
            page += 1;
            x = await axios.get(url+urlAdd, options);
            results.data = results.data.concat(x.data);
        }
        if (user){
          forumCache.set('forum-'+user.id, results);
        }
        return filterResults(results, query);
    }catch(ex){
        console.error("ERROR", ex);
        return {data: []};
    }
    
}

const getTopicsNoCache = async (user, query) => {
  let config = require('config');
  const forumApiConfig = config.get("forumApi");

  const jwt = user.jwt;
  const options = {
      withCredentials: true,
      headers: {
          'Authorization': `Bearer ${jwt}`
      }
  };

  let url = forumApiConfig.baseUrl;

  let queryKeys = [];
  query.limit=TOPIC_RES_LIMIT;
  if (typeof(query) === "object"){
      queryKeys = Object.keys(query);
      for (let i=0; i<queryKeys.length; i++){
          url += (i==0) ? "?" : "&";
          url += queryKeys[i] + "=" + query[queryKeys[i]];
      }
  }

  try{
      let results = {data: []};
      let x = await axios.get(url, options);
      results.data = results.data.concat(x.data);
      let page = 1;
      while (x.data.length >= TOPIC_RES_LIMIT){
          let urlAdd = (queryKeys.length > 0) ? "&" : "?";
          urlAdd += "page=" + page;
          page += 1;
          x = await axios.get(url+urlAdd, options);
          results.data = results.data.concat(x.data);
      }
      forumCache.set('forum-'+user.id, results);
  }catch(ex){
      console.error("ERROR", ex);
  }
  forumCache.set('forumFetching-'+user.id, false);
  forumCache.del('forumFetching-'+user.id);
  
}

const createTopic = async function(topicName, parent, user){
    var config = require('config');
    const forumApiConfig = config.get("forumApi");
    const url = forumApiConfig.baseUrl;

    var topic = {
        name: topicName
    };

    if (parent){
        topic.parent_id = parent;
    }

    const options = {
        withCredentials: true,
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${user.jwt}`
        }
    };

    //invalidate cache
    forumCache.del(forumCache.keys());
    const response = await axios.post(url, topic, options);
    return response;
}


const createTopicIfDoesNotExist = async function(topicName, user){
    let config = require('config');
    const forumApiConfig = config.get("forumApi");

    var newG = user.groups.slice();
    newG.push(config.get('adminGroup'));

    const options = {
        withCredentials: true,
        headers: {
            'Authorization': "Bearer "+modifyJWTGroups(user.jwt, newG)
        }
    };

    const url = forumApiConfig.baseUrl + '/?name='+topicName;
    const parentTopicResponse = await axios.get(url, options);

    if(parentTopicResponse) {
        if(parentTopicResponse.data.length === 0) {
            // user.groups = [user.organization, config.get('requiredRoleToCreateRequest')];
            // user.jwt = modifyJWTGroups(user.jwt, user.groups);
            
            const response = await createTopic(topicName, parentTopicResponse.data._id, user);
            return response;

        } else {
            parentTopicResponse.data = parentTopicResponse.data[0];
            return parentTopicResponse;
        }
    }
}

var modifyJWTGroups = function(token, newGroups){
    var config = require('config');
    var jwt = require('jsonwebtoken');
    var secret = config.get("jwtSecret")
    var decoded = jwt.verify(token, secret);
    decoded.groups = newGroups;
    var tempToken = jwt.sign(decoded, secret);
    return tempToken;
};

module.exports = {
    getTopic,
    getTopics,
    getVersion,
    addTopic,
    addComment,
    getComments,
    getAllComments
}
