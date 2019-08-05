FROM alpine:latest
WORKDIR /
# Install curl for rest solr calls
RUN apk --no-cache add curl
# Copy importer scripts
COPY ./solr_importer/init_scheme.sh /init_scheme.sh
COPY ./solr_importer/import_sample_data.sh /import_sample_data.sh
COPY ./solr_importer/init_scheme_with_sample_data.sh /init_scheme_with_sample_data.sh
# Copy sample data
COPY ./solr_importer/sample-data/df_all_pseudo-01_small.csv /sample-data/df_all_pseudo-01_small.csv

RUN chmod +x /init_scheme.sh
RUN chmod +x /import_sample_data.sh
RUN chmod +x /init_scheme_with_sample_data.sh
ENTRYPOINT ["/init_scheme_with_sample_data.sh"]