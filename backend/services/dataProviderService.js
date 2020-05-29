const forumClient = require('../clients/forum_client');
let log = require('npmlog');

const listDataProviders = async (user) => {

    try {
        if(!user.isApprover && !user.isAdmin) { throw new Error("User does not have access."); }

        let topics = [];
        let providers = [];
        const topicResponse = await forumClient.getTopics(user);
        topics = topicResponse.data.filter(item => item.parent_id);

        for(const topic of topics) {
            for(const authorGroup of topic.author_groups) {
                if (!providers.includes(authorGroup)) { providers.push(authorGroup); }
            }
        }

        return providers;
    } catch (e) {
        log.error(e);
        throw new Error(e.message)
    }

}

module.exports = {
    listDataProviders
}
