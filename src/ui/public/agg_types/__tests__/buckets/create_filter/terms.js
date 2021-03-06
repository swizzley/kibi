describe('AggConfig Filters', function () {
  let expect = require('expect.js');
  let ngMock = require('ngMock');

  describe('terms', function () {
    let AggConfig;
    let indexPattern;
    let Vis;
    let createFilter;

    beforeEach(ngMock.module('kibana', function ($provide) {
      $provide.constant('kbnDefaultAppId', '');
      $provide.constant('kibiDefaultDashboardTitle', '');
      $provide.constant('elasticsearchPlugins', ['siren-join']);
    }));
    beforeEach(ngMock.inject(function (Private) {
      Vis = Private(require('ui/Vis'));
      AggConfig = Private(require('ui/Vis/AggConfig'));
      indexPattern = Private(require('fixtures/stubbed_logstash_index_pattern'));
      createFilter = Private(require('ui/agg_types/buckets/create_filter/terms'));
    }));

    it('should return a match filter for terms', function () {
      let vis = new Vis(indexPattern, {
        type: 'histogram',
        aggs: [ { type: 'terms', schema: 'segment', params: { field: '_type' } } ]
      });
      let aggConfig = vis.aggs.byTypeName.terms[0];
      let filter = createFilter(aggConfig, 'apache');
      expect(filter).to.have.property('query');
      expect(filter.query).to.have.property('match');
      expect(filter.query.match).to.have.property('_type');
      expect(filter.query.match._type).to.have.property('query', 'apache');
      expect(filter.query.match._type).to.have.property('type', 'phrase');
      expect(filter).to.have.property('meta');
      expect(filter.meta).to.have.property('index', indexPattern.id);

    });

  });
});
