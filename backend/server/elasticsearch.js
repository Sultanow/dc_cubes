var elasticsearch = require('elasticsearch');

var elasticClient = new elasticsearch.Client({
    host: 'elasticsearch:9200',
    log: 'info'
});

var indexName = 'dc_cubes';

function indexExists() {
    return elasticClient.indices.exists({
        index: indexName
    });
}
exports.indexExists = indexExists;

function initIndex() {
    return elasticClient.indices.create({
        index: indexName
    });
}
exports.initIndex = initIndex;

function deleteIndex() {
    return elasticClient.indices.delete({
        index: indexName
    });
}
exports.deleteIndex = deleteIndex;

/*
function initMapping() {
    return elasticClient.indices.putMapping({
        index: indexName,
        type: 'lorem',
        body: {
            properties: {
                title: { type: 'string' },
                suggest: {
                    type: 'completion',
                    analyzer: 'simple',
                    search_analyzer: 'simple',
                    payloads: true
                }
            }
        }
    });
}
exports.initMapping = initMapping;
*/

/*
function addLorem(lorem) {
    return elasticClient.index({
        index: indexName,
        type: 'lorem',
        body: {
            title: lorem.title,
            suggest: {
                input: lorem.title.split(' '),
                output: lorem.title,
                payload: lorem.metadata || {}
            }
        }
    });
}
exports.addLorem = addLorem;
*/

function getSuggestions(input) {
    return elasticClient.suggest({
        index: indexName,
        type: 'book',
        body: {
            docsuggest: {
                text: input,
                completion: {
                    field: 'suggest',
                    fuzzy: true
                }
            }
        }
    })
}
exports.getSuggestions = getSuggestions;