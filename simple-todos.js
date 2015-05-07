Tasks = new Mongo.Collection("tasks");

if (Meteor.isClient) {
  // This code only runs on the client
  Template.body.helpers({
    tasks: function() {
      if (Session.get("hideCompleted")) {
        // If hide completed is checked, filter tasks
        return Tasks.find({checked: {$ne: true}}, {sort: {createdAt: -1}});
      } else {
        return Tasks.find({}, {sort: {createdAt: -1}});
      }
    },
    hideCompleted: function() {
      return Session.get("hideCompleted");
    },
    incompleteCount: function() {
      return Tasks.find({checked: {$ne: true}}).count();
    }
  });

  Template.body.events({
    "submit .new-task": function(event){
      // Function calls to addTask method when the task form is submitted
      var text = event.target.text.value;
      Meteor.call("addTask, text");
      // Clear form
      event.target.text.value = "";
      // Prevent default form submit
      return false;
    },
    "change .hide-completed input": function(event) {
      Session.set("hideCompleted", event.target.checked);
    }
  });

  Template.task.events({
    "click .toggle-checked": function(){
      // Calls the setChecked method 
      Meteor.call("setChecked", this._id, ! this.checked)
    },
    "click .delete": function(){
      Meteor.call("deleteTask", this._id)
    }
  });

  Accounts.ui.config({
    passwordSignupFields: "USERNAME_ONLY"
  });
}

Meteor.methods({
  addTask: function(text) {
    if (! Meteor.userId()) {
      throw new Meteor.Error("not-authorized");
    }
    Tasks.insert({
      text: text,
      createdAt: new Date(),
      owner: Meteor.userId(), //_id of logged in user
      username: Meteor.user().username //username of logged in user
    });
  },
  deleteTask: function(taskId) {
    Tasks.remove(taskId);
  },
  setChecked: function(taskId, setChecked) {
    // Set the checked property to the opposite of its current value
    Tasks.update(taskId, { $set: {checked: setChecked}});
  }
});