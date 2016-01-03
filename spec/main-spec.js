(function() {
  var ComponentRegistry, MyComposerButton, MyMessageSidebar, activate, deactivate, _ref;

  ComponentRegistry = require('nylas-exports').ComponentRegistry;

  _ref = require('../lib/main'), activate = _ref.activate, deactivate = _ref.deactivate;

  MyMessageSidebar = require('../lib/my-message-sidebar');

  MyComposerButton = require('../lib/my-composer-button');

  describe("activate", function() {
    return it("should register the composer button and sidebar", function() {
      spyOn(ComponentRegistry, 'register');
      activate();
      expect(ComponentRegistry.register).toHaveBeenCalledWith(MyComposerButton, {
        role: 'Composer:ActionButton'
      });
      return expect(ComponentRegistry.register).toHaveBeenCalledWith(MyMessageSidebar, {
        role: 'MessageListSidebar:ContactCard'
      });
    });
  });

  describe("deactivate", function() {
    return it("should unregister the composer button and sidebar", function() {
      spyOn(ComponentRegistry, 'unregister');
      deactivate();
      expect(ComponentRegistry.unregister).toHaveBeenCalledWith(MyComposerButton);
      return expect(ComponentRegistry.unregister).toHaveBeenCalledWith(MyMessageSidebar);
    });
  });

}).call(this);
