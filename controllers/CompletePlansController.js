﻿angular.module('WDApp.CompletePlans', [])
 .controller("CompletePlansController",
    ["$scope", "$rootScope", "$state"  , "ngCart", "WDFactory" , "RESTStoreItems", "workoutService", "$modal","$window",

    function ($scope, $rootScope, $state, ngCart, WDFactory, RESTStoreItems, workoutService, $modal, $window) {
   
   
   
    
    $scope.Pagination = {};
    $scope.DisplayModeEnum = {
        Card: 0,
        List: 1
    };
    $scope.ItemTypeEnum={
        dayWorkout:1,
        fullExercise:2
    }
    $scope.changeDisplayMode = function (displayMode) {
        
        switch (displayMode)
        {
            case $scope.DisplayModeEnum.Card:
                $scope.listDisplayModeEnabled = false;
                break;
            case $scope.DisplayModeEnum.List:
                $scope.listDisplayModeEnabled = true;
                break;
        }
    };
   
    $scope.restSearchDefault = function () {
        $scope.Criteria = {
            LevelIDs: ""
                , PlanTypeIDs: "",
            ObjectiveIDs: "",
            BodyParts: ""
                , PlanName: ""
                , FreeOrPaid: ""
                , CompleteOrDay: ""
                , Page: ""
        };
        $scope.SendStoreItemRequest();
    }
  $scope.AdminID = 20;
     $scope.UserID = $rootScope.UserID();
     $scope.language = $rootScope.currentLanguage();
     if ($scope.UserID != $scope.AdminID)
     {
        
     }
     $scope.getPlanTypeString = function (plantype) {
         if (plantype)
         {
             if ($scope.language == 'en-US')
                 return $rootScope.CompleteOrDay[plantype - 1].text;
             else
                 return $rootScope.CompleteOrDay[plantype - 1].textAR;

         }
             
         else
             return "";
     }
     $scope.getLevelString = function (levelNum) {
         
         if (levelNum){
             if($scope.language=='en-US')
                 return $rootScope.Level[levelNum - 1].text;
             else
                 return $rootScope.Level[levelNum - 1].textAR; 
         }
         else
             return "";

     }
    
    $scope.Pagination.CurrentPage = 1;
     
    $scope.maxSize = 10; 
        
   
    $scope.$watch('Pagination.CurrentPage', function (newpageValue) { 
        
        $scope.Criteria.Page = newpageValue;
        workoutService.setCurrentPage(newpageValue);
        $scope.Criteria = workoutService.getCriteria();
         $scope.SendStoreItemRequest();
    });
         
    $scope.$watch(
    function () { return workoutService.getTotalItems(); },
    function (data) {  $scope.TotalItems = data; },
    true
);
 

    $scope.$watch(
   function () { return workoutService.getWorkoutList(); },
   function (data) { $scope.Workouts = data; },
   true
   );

   
   
    $scope.SendStoreItemRequest = function () {
        
      
        $scope.myPromise=   RESTStoreItems.get({
            LevelIDs: $scope.Criteria.LevelIDs, PlanTypeIDs: $scope.Criteria.PlanTypeIDs
            , ObjectiveIDs: $scope.Criteria.ObjectiveIDs, BodyParts: $scope.Criteria.BodyParts
            , PlanName: $scope.Criteria.PlanName, Isfree: $scope.Criteria.FreeOrPaid
            , DirectoryTypes: $scope.Criteria.CompleteOrDay, page: $scope.Criteria.Page
             , minWeek: $scope.Criteria.minWeek, maxWeek: $scope.Criteria.maxWeek
            , culture: $('#hdn_tm_culture').val()
            
        }, function (respond) {
         
            $scope.Workouts = workoutService.ManageWorkouts(respond.storeList);
            
            $scope.TotalItems = respond.TotalCount;
         });
    }
         
    $scope.goDetails = function (item) {
        
     

        $state.go("WorkoutDetails", { "workoutID": item.FK_ItemId, "planTypeID": item.ItemType })
    }

    $scope.goPurchaseItems = function () {

        $state.go("purchaseItems");
    }
     
    $scope.addToAccount = function (item) {
      
        
        
        if ($scope.UserID != "-1")
        {
            switch (item.ItemType)
            {
                case $scope.ItemTypeEnum.dayWorkout:
                    $scope.addToAccountPromise = WDFactory.reapplyWorkout({ workoutID: item.FK_ItemId }).success(function (data) {
                        WDFactory.addWorkoutToAccount({ ItemID: item.ProductID, NewProductID: data }).success(function (data) {
                            $scope.showToaster("added");
                            item.isPurchased = true;
                            

                        }
                       )

                    });
                    break;
                case $scope.ItemTypeEnum.fullExercise:
                    $scope.addToAccountPromise = WDFactory.reapplyExercisePlan({ planID: item.FK_ItemId }).success(function (data) {
                        WDFactory.addWorkoutToAccount({ ItemID: item.ProductID, NewProductID: data }).success(function (data) {
                            $scope.showToaster("added");
                            item.isPurchased = true;
                           
                        }
                       )

                    });
                    break;

            }
             
            

        } else
        {
            $scope.showToaster("login");

        }
        
    }
    
    $scope.addToCart = function (item) {
        
        ngCart.addItem(item.ProductID, item.DisplayName, item.Price,1,{FK_ItemId:item.FK_ItemId,ItemType:item.ItemType})
    };

    $scope.showAddedToCart = function (id) {
       
        return ngCart.getItemById(id);
    }
    $scope.removeItemById  = function (id) {
        ngCart.removeItemById(id);
    }
    $scope.showToaster = function (status) {
        switch (status)
        {
            case "added":
                if ($scope.language == "ar-JO")
                    toastr.success("تمت اضافة هذا التدريب الى حسابك");
                else
                    toastr.success("your plan added Successfully to your account");
                break;
            case "login":
                if ($scope.language == "ar-JO")
                    toastr.info("الرجاء تسجيل الدخول اولا");
                else
                    toastr.info("please login first");
                break;
            case "Removed":
                if ($scope.language == "ar-JO")
                    toastr.info("تمت الازالة بنجاح ");
                else
                    toastr.info("Item removed Succesfully form Store ");
                break;
            case "Removederror":
                if ($scope.language == "ar-JO")
                    toastr.info("لا يمكنك ازالة من المتجر , لقد نم شراؤه من قبل");
                else
                    toastr.info("you cann't delete this item becuase it have been purchased ");
                break;

        }
     
        }
      
    $scope.editStoreItem = function (item) {
         
       var modalInstance= $modal.open({
            animation: true,
            templateUrl: 'addWorkoutModalContent.html',
            controller: 'addWorkoutCtrl',
            size: 'lg',
            resolve: {
                storeItem: function () {
                    return item ;
                },
                scope:function(){
                    return $scope;
                } 
            }
        });

       

    }

    $scope.removeStoreItem = function (item) {
       
        var deleteItem = $window.confirm('Are you absolutely sure you want to delete?');

        if (deleteItem)
        {
              WDFactory.removeStoreItem( {productID:item.ProductID}).success(function (data) {
            $scope.showToaster("Removed");
            var indextoRemove = $scope.Workouts.indexOf(item);
            if (indextoRemove > -1)
                $scope.Workouts.splice(indextoRemove, 1);


        }).error(function () {
            $scope.showToaster("Removederror");
        });

        }
       
    }

    $scope.addWorkout = function () {  
       
        $modal.open({
            animation: true,
            templateUrl: 'addWorkoutModalContent.html',
            controller: 'addWorkoutCtrl',
            size: 'lg',
            resolve: {
                storeItem: function () {
                    return null;
                },
                scope: function () {
                    return null;
                }
            }
        });
    }
    }]);





