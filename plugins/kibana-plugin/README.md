# Design Decision for Implementing a Plug-In

| Approach      | Description  | Pros         | Cons  |
|:------------- |:-------------|:-------------| :-----|
| Use **Kibana Canvas** | Ready-made elements are puzzled together. Key numbers are placed in a (info)graphic and backed by queries (ESSQL, Canvas expression language, or Lucene) | Minimal effort, high maintainability | Little flexibility in querying, no complex queries possible. |
| **Canvas + Kibana App:** Develop Kibana Plug-In, Use Kibana Canvas | Develop separate elements using React-based Kibana Plug-In API, use these by the standard Canvas | Moderate effort, moderate maintainability | Flexibility is limited, Canvas cannot be extended by custome code, Low usability|
| **Custom Kibana Canvas:** Develop Kibana Canvas Plug-In | Extend Canvas Elements by own code using React | Medium flexibility in visualization. | Medium flexibility in querying. High effort, risk of high maintainability depending on your own code structure |
| **Kibana Visualization Plugin App:** Develop Kibana Plug-In without using Kibana Canvas or other Standard Components | Build a Kibana PLug-In by implementing the component for interactive visualization without using standard components | High effort, less maintainability which depends on size and structure of own code | Very flexible |
| Develop **Kibana Visualization Plugin**. | Develop Kibana Visualization Plugin as embedded visualization |  Hight Effort. Less Flexibility | High reusability in Kibana: Use Visualization in multiple Dashboards, simple without any advanced options. |


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
Since the functionality of displaying the queue status and an item's history is not so extensive, we must not scatter code over many components. Rather, we can integrate this in a minimalist way in one component. Therefore we want to avoid this approach and try to build everything compactly into one component by the next approach *Developing Kibana Canvas Plug-In*. Note that the current Plug-In API is beeing replaced by a new concept. As of the official site [Introducing a new architecture for Kibana](https://www.elastic.co/de/blog/introducing-a-new-architecture-for-kibana) the makers of Elastic will be disabling the legacy plugin API in 7.11

## Develop Kibana Canvas Plug-In
This is a flexible way of developing a fully interactive canvas that is able to use queries which are complex as needed. The query results even can be postprocessed by custom functional code. Buttons and drop downs might be integrated into such an canvas without restriction. It should be noted that this API still is in development an to be considered as "Beta", see this [Link](https://discuss.elastic.co/t/custom-kibana-canvas-elements/202632/2) for more details.

### Conclusion
As long as we focus delimited and targeted functionality on one visualization component, this approach is appropriate. If the Canvas Plug-In API leafes its beta status and becomes future-proof, we would choose this approach to depict the overall status of the queues. An interactive search allows us to display the history and currnt location of a specific item.

## Develop Kibana Plug-In without using Kibana Canvas or other Standard Components
This is the most flexible way of developing the Plug-In, since we take advantage of the fact that we are not limited to use standard components. We develop the complete visualization and interaction part by our own. But at least the access to the Elasticsearch data sources is standardized. Exactly this standard we use for querying and retrieving the data.

### Conclusion
Being focussed on dedicated functionality in visualizating the queue status, this approach is the most appropriate. We follow this approach in the first step and we can migrate the implemented functionality later into an more standardized solution, if the standard components or the Kibana Canvas API become more powerful.
