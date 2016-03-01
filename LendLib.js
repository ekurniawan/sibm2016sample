/* global lists */
lists = new Mongo.Collection("lists");




if (Meteor.isClient) {
    
  Template.categories.helpers({
      lists:function(){
          return lists.find({},{sort:{Category:1}});
      },
      new_cat:function(){
          return Session.equals("adding_category",true);
      },
      list_status:function(){
          if(Session.get("current_list")){
               if(Session.equals("current_list",this._id))
                    return " btn-info";
          }
          return " btn-primary";
      }
  });

  Template.categories.events({
      'click #btnNewCat':function(e,t){
          Session.set("adding_category",true);
          Tracker.flush(); 
          focusText(t.find("#add-category"));
      },
      'keyup #add-category':function(e,t){
          if(e.which===13){
              var catVal = String(e.target.value || "");
              if(catVal){
                  lists.insert({Category:catVal});
                  Session.set("adding_category",false);
              }
          }
      },
      'focusout #add-category':function(e,t){
          Session.set("adding_category",false);
      },
      'click .category':selectCategory,
      'click #btnDeleteCat':function(e,t){
          //console.log("btnDelete : " + Session.get("current_list"));
          lists.remove({"_id":Session.get("current_list")});
          Session.set("current_list",null);
      }
  });
  
  function focusText(i,val){
      i.focus();
      i.value = val?val:"";
      i.select();
  }
  
  function selectCategory(e,t){
        Session.set("current_list",this._id);
  }
  
  Template.list.helpers({
      items:function(){
          if(Session.get("current_list")){
                var cats = lists.findOne({_id:Session.get("current_list")});
                if(cats && cats.items){
                    for(var i=0;i<cats.items.length;i++){
                        var itm = cats.items[i];
                        itm.Lendee = itm.LentTo ? itm.LentTo : "free";
                        itm.LendClass = itm.LentTo ? "label-danger" : "label-success";
                    }
                }
                return cats.items;               
          }
          return null;
      },
      list_selected:function(){
          return (!Session.equals("current_list",null));
      },
      list_adding:function(){
          return (Session.equals("list_adding",true));
      },
      lendee_editing:function(){
          return (Session.equals("lendee_input",this.Name));
      }
  });
  
  Template.list.events({
      'click #btnAddItem':function(e,t){
          Session.set("list_adding",true);
          Tracker.flush();
          focusText(t.find("#item_to_add"));
      },
      'keyup #item_to_add':function(e,t){
          if(e.which===13){
              addItem(Session.get("current_list"),e.target.value);
              Session.set("list_adding",false);
          }
      },
      'focusout #item_to_add':function(e,t){
          Session.set("list_adding",false);
      },
      'click .delete_item':function(e,t){
          removeItem(Session.get("current_list"),e.target.id);
      },
      'click .lendee':function(e,t){
          Session.set("lendee_input",this.Name);
          Tracker.flush();
          focusText(t.find("#edit_lendee"),this.LentTo);
      },
      'keyup #edit_lendee':function(e,t){
          if(e.which===13){
              updateLendee(Session.get("current_list"),
                this.Name,e.target.value);
              Session.set("lendee_input",null);
          }
          if(e.which===27){
              Session.set("lendee_input",null);
          }
      }
  });
  
  //fungsi untuk menambah data
  function addItem(list_id,item_name){
      if(!item_name && !list_id) return;
      lists.update({_id:list_id},{$addToSet:{items:{Name:item_name}}});
  }
  
  //fungsi untuk mendelete data
  function removeItem(list_id,item_name){
      if(!item_name && !list_id) return;
      lists.update({_id:list_id},{$pull:{items:{Name:item_name}}});
  }
  
  //fungsi untuk mengupdate lendee
  function updateLendee(list_id,item_name,lendee_name){
      var lendeeData = lists.findOne({"_id":list_id},{"items.Name":"item_name"});
      if(lendeeData && lendeeData.items){
        for(var i=0;i<lendeeData.items.length;i++){
            if(lendeeData.items[i].Name === item_name){
                var updateItem = {};
                updateItem['items.' + i + '.LentTo']=lendee_name;
                lists.update({"_id":list_id},{$set:updateItem});
                break;
            }   
        }   
      }
  }
}

if (Meteor.isServer) {
  Meteor.startup(function () {
    // code to run on server at startup
  });
}
