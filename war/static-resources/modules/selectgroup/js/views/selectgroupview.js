define(function(require) {
	var Backbone = require('backbone');
	var Sandbox = require('sandbox');

	var user = require('components/login/login');
	
	require('css!./../../css/selectgroup.css');
	
	var SelectGroupView = Sandbox.View.extend({
		initialize : function(options) {
			this.options = _.extend({
			//defaults here
			}, options);
			this.render();
			this.getGroups();
		},
		template : Handlebars.compile(require('text!./../../templates/selectgrouptemplate.html')),
		elementTemplate : Handlebars.compile(require('text!./../../templates/groupelement.html')),
		render : function(data) {
			$(this.el).html(this.template(data));
		},
		events : {
			'click .js-group-entry' : 'groupClicked',
			'click .js-delete-group' : 'deleteGroup'
			
		},
		getGroups : function(){
			var data = {
				url : '_ah/api/userendpoint/v1/user/' + user.getInfo().userId + '/group',
				callback : this.renderGroups,
				context : this,
				dataType: 'json',
				cached : true,
				loaderContainer : this.$('.groups-container')
			};
			Sandbox.doGet(data);
		},
		renderGroups : function(data){
			this.groupsMap = {};
			
			data.items = _.filter(data.items, function(el){
				return el.groupType!='dummy';
			});
			
			
			for(var groupIndex in data.items){
				this.groupsMap[data.items[groupIndex].groupId] = data.items[groupIndex];
			}
			_.each(data.items, function(group){
				var membersNames = [];
				_.each(group.members, function(member){
					membersNames.push(member.fullName);
				});
				
				group.membersNames =((membersNames.length>1)? membersNames.slice(0, membersNames.length - 1).join(', ') + ' and ' :'Only ').concat(
			            membersNames[membersNames.length - 1]);
			});
			this.$('.groups-container').html(this.elementTemplate(data));

			this.$('.error').css({display:data.items && data.items.length!==0?'none':''});
		},
		reInitialize : function(){
			this.getGroups();
		},
		groupClicked : function(event){
			Sandbox.publish('GROUP:SELECTED:'+this.options.owner || 'ALL', this.groupsMap[$(event.currentTarget).data('groupId')]);
		},
		deleteGroup : function(event){
			var group = this.groupsMap[$(event.currentTarget).data('groupId')];
			var confirmation = confirm('Are you sure you want to delete this group, ' + group.groupName + ' ?');
			
			if(!confirmation){
				return;
			}
			//TODO : Delete group here.
			
		}
		
	});

	return SelectGroupView;

});