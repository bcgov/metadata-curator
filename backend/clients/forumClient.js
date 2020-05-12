const axios = require('axios');

const addTopic = async (name, user) => {
    if (user.organization){
        console.log("biz category exists");
        const parentTopicResponse = await createTopicIfDoesNotExist(user.organization, user);
        if(!parentTopicResponse) {
            throw new Error("Error creating/fetching parent topic");
        }
        parentId = parentTopicResponse.data._id;

        topicResponse = await createTopic(name, parentId, user);
    } else {
        topicResponse = await createTopic(name, null, user)
    }

    console.log("topicResponse: ", topicResponse);
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

    const response = await axios.post(url, topic, options);
    return response;
}


const createTopicIfDoesNotExist = async function(topicName, user){
    let config = require('config');
    const forumApiConfig = config.get("forumApi");

    var newG = user.groups.slice();
    newG.push("admin");

    const options = {
        withCredentials: true,
        headers: {
            'Authorization': "Bearer "+modifyJWTGroups(user.jwt, newG)
        }
    };

    const url = forumApiConfig.baseUrl + '/?name='+topicName;
    const parentTopicResponse = await axios.get(url, options);
    console.log("parentTopic response is: ", parentTopicResponse);

    if(parentTopicResponse) {
        console.log("parent topic response came back");
        console.log("parentTopicResponse.data: ", parentTopicResponse.data);
        if(parentTopicResponse.data.length === 0) {
            console.log("create parent topic");
            // create parent topic
            var origGroups = user.groups.slice();
            var origJwt = user.jwt;
            user.groups = [user.organization, config.get('requiredRoleToCreateRequest')];
            user.jwt = modifyJWTGroups(user.jwt, user.groups);

            // create upload topic
            const response = await createTopic(topicName, parentTopicResponse.data._id, user);
            return response;

        }

        console.log("return existing parent topic");
        // return parent topic
        return parentTopicResponse;
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
    addTopic,
    addComment,
    getComments
}