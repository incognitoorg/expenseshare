define(function(require) {
	
	var FEMGroupCollection = require('./js/collection/groupcollection');
	var FEMGroupModel = require('./js/model/groupmodel');

	return {
		getInstance : function(){
			return {
				initialize : function(options){
					this.collection = new FEMGroupCollection();
					if(options.moduleName==='js-create-group'){
						this.createGroup(options);
					}else {
						this.editGroup(options);
					}
				},
				createGroup : function(options){
					console.log('inside createGroup function',options);
					var self=this;
					require(['modules/addgroup/addgroup'],function(FEMAddGroupModule){
						FEMAddGroupModule.getInstance().initialize({'el':options.el,'model':FEMGroupModel,'collection':self.collection});
					});
				},
				editGroup : function(options){
					var self=this;
					require(['modules/selectgroup/selectgroup'],function(FEMSelectGroupModule){
						FEMSelectGroupModule.getInstance().initialize({'el':options.el,'model':FEMGroupModel,'collection':self.collection});
					});
				},
				getGroups : function(){
					
				}
			};
		}
	};
	
});