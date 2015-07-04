define(['knockout', 'components/<%= filename %>/<%= filename %>'], function(ko, subject) {
  var <%= viewModelClassName %> = subject.viewModel;

  describe('<%= name %> view model test', function() {

    it('should set activePages to 1 when not defined', function() {
      var instance = new DotsBarViewModel();
      expect(1).toEqual(1);
    });

  });

});
