# Design Decision for Implementing a Plug-In

| Approach      | Description  | Pros         | Cons  |
|:------------- |:-------------|:-------------| :-----|
| Use Kibana Canvas | Ready-made elements are puzzled together. Key numbers are placed in a (info)graphic and backed by queries (ESSQL, Canvas expression language, or Lucene) | Minimal effort, high maintainability | Little flexibility in querying, no complex queries possible. |
| Develop Kibana Plug-In, Use Kibana Canvas | Develop separate elements using React-based Kibana Plug-In API, use these by the standard Canvas | Moderate effort, moderate maintainability | Flexibility is limited, Canvas cannot be extended by custome code. |
| Develop Kibana Canvas Plug-In | Extend Canvas by own code using React | High effort, risk of high maintainability depending on your own code structure | Very high flexibility in querying, interaction, and visualization. |

## Use Kibana Canvas
This approach we use for a simple
Canvas expression language 
