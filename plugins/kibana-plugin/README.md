# Design Decision for Implementing a Plug-In

| Approach      | Description  | Pros         | Cons  |
|:------------- |:-------------|:-------------| :-----|
| Use Kibana Canvas | Ready-made elements are puzzled together. Key numbers are placed in a (info)graphic and backed by queries (ESSQL, Canvas expression language, or Lucene) | Minimal effort, high maintainability | Little flexibility in querying, no complex queries possible. |
| Develop Kibana Plug-In, Use Kibana Canvas | Develop separate elements using React-based Kibana Plug-In API, use these by the standard Canvas | Moderate effort, moderate maintainability | Flexibility is limited, Canvas cannot be extended by custome code. |
| Develop Kibana Canvas Plug-In | Extend Canvas by own code using React | High effort, risk of high maintainability depending on your own code structure | Very high flexibility in querying, interaction, and visualization. |

## Use Kibana Canvas
This approach is used for an Infographics that shows basic key numbers such as **queue size** and prospectively **queue throughput** for different queues.
One significant disadvantage is that queries for calculating those key numbers are limited. For example, we cannot calculate the **queue throughput** at this moment using the given data model. Calculating the throughput requires us to calculate the intersection (cut set) between two sets of queued items. We have an index called "queues" that stores snapshots of queue states as follows:
Each document contains (along some other fields) the following fields:

* **timestamp**: type=date, and it is searchable, aggregatable
* **items**: type=string, and it is searchable

The field items contains a large string consisting thousands of unsorted IDs, for example **items**="2070213614 2909589973 2771050342 ..."

<img src="https://discuss.elastic.co/uploads/short-url/oBKpRZkEdkNIMNlN2U4lOSRaxyf.png" alt="grafana-plugin" />

We need to query two rows (for two given timestamps) and calculate the intersection (cut set) of both item lists. Ultimately we need to know the size of this cut set. It is difficult to deal with this problem, if we want to display the calculated size of this intersection in an Infographics Canvas in Kibana. The queries we are able to use are [ESSQL](https://www.elastic.co/de/blog/an-introduction-to-elasticsearch-sql-with-practical-examples-part-1), Lucene, or the [Canvas expression language](https://www.elastic.co/guide/en/kibana/current/canvas-function-reference.html) that supports [TinyMath functions](https://www.elastic.co/guide/en/kibana/current/canvas-tinymath-functions.html). Array functions such as [ARRAY_INTERSECT](https://docs.couchbase.com/server/current/n1ql/n1ql-language-reference/arrayfun.html#fn-array-intersect), which are available in Couchbase, are not provided in Elasticsearch. 

### Conclusion
We use Kibana Canvas for an Infographics that shows the state of all queues at a glance. At this moment it is a rough overview displaying the size of each queue. As the features of Kibana and Elasticsearch increase, especially as the query language becomes more powerful including functionalities of [Arrays](https://www.elastic.co/guide/en/elasticsearch/reference/current/array.html), we will further elaborate on the infographic. Then we also show the throughput with these on-board resources.

## Develop Kibana Plug-In, Use Kibana Canvas
This is a compromise between flexibility and implementation plus maintainance effort. Using [Kibana Plug-Ins](https://www.elastic.co/guide/en/kibana/current/kibana-plugins.html) we are more close to standard components, but must maintain code snippets for separate components that integrate into each other by the Kibana workflow. For example a button that trigger some individual action or setting is placed into Kibana's static UI structure. 

### Conclusion
Since the functionality of displaying the queue status and an item's history is not so extensive, we must not scatter code over many components. Rather, we can integrate this in a minimalist way in one component. That

## Develop Kibana Canvas Plug-In
This is the most flexible way of developing a fully interactive canvas that is able to use queries which are complex as needed. The query results even can be postprocessed by custom functional code. Buttons and drop downs might be integrated into such an canvas without restriction. It should be noted that this API still is in development an to be considered as "Beta", see this [Link](https://discuss.elastic.co/t/custom-kibana-canvas-elements/202632/2) for more details.

### Conclusion
