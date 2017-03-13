describe('Notifier', function () {
  const _ = require('lodash');
  const ngMock = require('ngMock');
  const expect = require('expect.js');
  const sinon = require('sinon');
  const Notifier = require('kibie/notify/notifier');

  describe('Notifier', function () {
    let $interval;
    const message = 'Oh, the humanity!';
    let notifier;
    let params;
    const version = window.__KBN__.version;
    const buildNum = window.__KBN__.buildNum;

    beforeEach(function () {
      ngMock.module('kibana');

      ngMock.inject(function (_$interval_) {
        $interval = _$interval_;
      });
    });

    beforeEach(function () {
      params = { location: 'foo' };
      while (Notifier.prototype._notifs.pop()); // clear global notifications
      notifier = new Notifier(params);
    });

    describe('#constructor()', function () {
      it('sets #from from given location', function () {
        expect(notifier.from).to.equal(params.location);
      });
    });

    describe('#error', function () {
      testVersionInfo('error');

      it('prepends location to message for content', function () {
        expect(notify('error').content).to.equal(params.location + ': ' + message);
      });

      it('sets type to "danger"', function () {
        expect(notify('error').type).to.equal('danger');
      });

      it('sets icon to "warning"', function () {
        expect(notify('error').icon).to.equal('warning');
      });

      it('sets title to "Error"', function () {
        expect(notify('error').title).to.equal('Error');
      });

      it('sets lifetime to 5 minutes', function () {
        expect(notify('error').lifetime).to.equal(300000);
      });

      it('sets timeRemaining and decrements', function () {
        var notif = notify('error');

        expect(notif.timeRemaining).to.equal(300);
        $interval.flush(1000);
        expect(notif.timeRemaining).to.equal(299);
      });

      it('closes notification on lifetime expiry', function () {
        var expectation = sinon.mock();
        var notif = notifier.error(message, expectation);

        expectation.once();
        expectation.withExactArgs('ignore');

        $interval.flush(300000);

        expect(notif.timerId).to.be(undefined);
      });

      it('allows canceling of timer', function () {
        var notif = notify('error');

        expect(notif.timerId).to.not.be(undefined);
        notif.cancelTimer();

        expect(notif.timerId).to.be(undefined);
      });

      it('resets timer on addition to stack', function () {
        var notif = notify('error');

        $interval.flush(100000);
        expect(notif.timeRemaining).to.equal(200);

        notify('error');
        expect(notif.timeRemaining).to.equal(300);
      });

      it('allows reporting', function () {
        var includesReport = _.includes(notify('error').actions, 'report');
        expect(includesReport).to.true;
      });

      it('allows accepting', function () {
        var includesAccept = _.includes(notify('error').actions, 'accept');
        expect(includesAccept).to.true;
      });

      it('includes stack', function () {
        expect(notify('error').stack).to.be.defined;
      });
    });

    describe('#custom', function () {
      let customNotification;
      let customText;
      let customParams;

      beforeEach(() => {
        customText = 'fooMarkup';
        customParams = {
          title: 'fooTitle',
          actions:[{
            text: 'Cancel',
            callback: sinon.spy()
          }, {
            text: 'OK',
            callback: sinon.spy()
          }]
        };
        customNotification = notifier.custom(customText, customParams);
      });

      afterEach(() => {
        customNotification.clear();
      });

      it('throws if second param is not an object', function () {
        // destroy the default custom notification, avoid duplicate handling
        customNotification.clear();

        function callCustomIncorrectly() {
          const badParam = null;
          customNotification = notifier.custom(customText, badParam);
        }
        expect(callCustomIncorrectly).to.throwException(function (e) {
          expect(e.message).to.be('config param is required, and must be an object');
        });

      });

      it('has a custom function to make notifications', function () {
        expect(notifier.custom).to.be.a('function');
      });

      it('properly merges options', function () {
        // destroy the default custom notification, avoid duplicate handling
        customNotification.clear();

        const explicitLifetimeParams = _.defaults({ lifetime: 20000 }, customParams);
        customNotification = notifier.custom(customText, explicitLifetimeParams);

        expect(customNotification).to.have.property('type', 'info'); // default
        expect(customNotification).to.have.property('title', explicitLifetimeParams.title); // passed in
        expect(customNotification).to.have.property('lifetime', explicitLifetimeParams.lifetime); // passed in

        expect(explicitLifetimeParams.type).to.be(undefined);
        expect(explicitLifetimeParams.title).to.be.a('string');
        expect(explicitLifetimeParams.lifetime).to.be.a('number');
      });

      it('sets the content', function () {
        expect(customNotification).to.have.property('content', `${params.location}: ${customText}`);
        expect(customNotification.content).to.be.a('string');
      });

      it('uses custom actions', function () {
        expect(customNotification).to.have.property('customActions');
        expect(customNotification.customActions).to.have.length(customParams.actions.length);
      });

      it('gives a default action if none are provided', function () {
        // destroy the default custom notification, avoid duplicate handling
        customNotification.clear();

        const noActionParams = _.defaults({ actions: [] }, customParams);
        customNotification = notifier.custom(customText, noActionParams);
        expect(customNotification).to.have.property('actions');
        expect(customNotification.actions).to.have.length(1);
      });

      it('defaults type and lifetime for "info" config', function () {
        expect(customNotification.type).to.be('info');
        expect(customNotification.lifetime).to.be(5000);
      });

      it('dynamic lifetime for "warning" config', function () {
        // destroy the default custom notification, avoid duplicate handling
        customNotification.clear();

        const errorTypeParams = _.defaults({ type: 'warning' }, customParams);
        customNotification = notifier.custom(customText, errorTypeParams);
        expect(customNotification.type).to.be('warning');
        expect(customNotification.lifetime).to.be(10000);
      });

      it('dynamic type and lifetime for "error" config', function () {
        // destroy the default custom notification, avoid duplicate handling
        customNotification.clear();

        const errorTypeParams = _.defaults({ type: 'error' }, customParams);
        customNotification = notifier.custom(customText, errorTypeParams);
        expect(customNotification.type).to.be('danger');
        expect(customNotification.lifetime).to.be(300000);
      });

      it('dynamic type and lifetime for "danger" config', function () {
        // destroy the default custom notification, avoid duplicate handling
        customNotification.clear();

        const errorTypeParams = _.defaults({ type: 'danger' }, customParams);
        customNotification = notifier.custom(customText, errorTypeParams);
        expect(customNotification.type).to.be('danger');
        expect(customNotification.lifetime).to.be(300000);
      });

      it('should wrap the callback functions in a close function', function () {
        customNotification.customActions.forEach((action, idx) => {
          expect(action.callback).not.to.equal(customParams.actions[idx]);
          action.callback();
        });
        customParams.actions.forEach(action => {
          expect(action.callback.called).to.true;
        });
      });
    });

    describe('#warning', function () {
      testVersionInfo('warning');

      it('prepends location to message for content', function () {
        expect(notify('warning').content).to.equal(params.location + ': ' + message);
      });

      it('sets type to "warning"', function () {
        expect(notify('warning').type).to.equal('warning');
      });

      it('sets icon to "warning"', function () {
        expect(notify('warning').icon).to.equal('warning');
      });

      it('sets title to "Warning"', function () {
        expect(notify('warning').title).to.equal('Warning');
      });

      it('sets lifetime to 10000', function () {
        expect(notify('warning').lifetime).to.equal(10000);
      });

      it('does not allow reporting', function () {
        let includesReport = _.includes(notify('warning').actions, 'report');
        expect(includesReport).to.false;
      });

      it('allows accepting', function () {
        let includesAccept = _.includes(notify('warning').actions, 'accept');
        expect(includesAccept).to.true;
      });

      it('does not include stack', function () {
        expect(notify('warning').stack).not.to.be.defined;
      });
    });

    describe('#info', function () {
      testVersionInfo('info');

      it('prepends location to message for content', function () {
        expect(notify('info').content).to.equal(params.location + ': ' + message);
      });

      it('sets type to "info"', function () {
        expect(notify('info').type).to.equal('info');
      });

      it('sets icon to "info-circle"', function () {
        expect(notify('info').icon).to.equal('info-circle');
      });

      it('sets title to "Debug"', function () {
        expect(notify('info').title).to.equal('Debug');
      });

      it('sets lifetime to 5000', function () {
        expect(notify('info').lifetime).to.equal(5000);
      });

      it('does not allow reporting', function () {
        var includesReport = _.includes(notify('info').actions, 'report');
        expect(includesReport).to.false;
      });

      it('allows accepting', function () {
        var includesAccept = _.includes(notify('info').actions, 'accept');
        expect(includesAccept).to.true;
      });

      it('does not include stack', function () {
        expect(notify('info').stack).not.to.be.defined;
      });
    });

    function notify(fnName) {
      notifier[fnName](message);
      return latestNotification();
    }

    function latestNotification() {
      return _.last(notifier._notifs);
    }

    function testVersionInfo(fnName) {
      context('when version is configured', function () {
        it('adds version to notification', function () {
          let notification = notify(fnName);
          expect(notification.info.version).to.equal(version);
        });
      });
      context('when build number is configured', function () {
        it('adds buildNum to notification', function () {
          let notification = notify(fnName);
          expect(notification.info.buildNum).to.equal(buildNum);
        });
      });
    }
  });
});
