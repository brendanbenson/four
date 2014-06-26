$(function() {
  FastClick.attach(document.body);
});

var createGuid = function () {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};

if (!localStorage.getItem('playerGuid')) {
  localStorage.setItem('playerGuid', createGuid());
}

var four = angular.module('four', ['ui.router']);

four.config(function ($stateProvider, $urlRouterProvider) {
  $urlRouterProvider.otherwise("/four");

  $stateProvider
    .state('start', {
      url: "/start",
      templateUrl: "start.html"
    })
    .state('invite', {
      url: "/invite",
      templateUrl: "invite.html"
    })
    .state('join', {
      url: "/join",
      templateUrl: "join.html"
    })
    .state('four', {
      url: "/four/:roomGuid",
      templateUrl: "four.html"
    })
    .state('fourFresh', {
      url: "/four",
      templateUrl: "four.html"
    })
});

four.controller('FourCtrl', ['$scope', '$rootScope', '$location', '$state', '$stateParams', 'IdService', 'SocketService',
  function ($scope, $rootScope, $location, $state, $stateParams, IdService, SocketService) {
    if(!$stateParams.roomGuid) {
      $state.go('four', {roomGuid: IdService.generateRoomId()});
    } else {
      $rootScope.inviteLink = $location.absUrl();
    }

    SocketService.emit('join', {room: $stateParams.roomGuid});

    $scope.move = function (columnIndex) {
      SocketService.emit('move', {columnIndex: columnIndex});
    };

    SocketService.on('update', function (data) {
      $scope.board = data.board;
      $scope.currentPlayer = data.currentPlayer;
      $scope.player = data.players[IdService.getPlayerGuid()];
      $scope.winner = data.winner;
      $scope.$apply();
    });

    SocketService.on('move', function(data) {
      $scope.board[data.columnIndex][data.rowIndex] = data.player;
      $scope.currentPlayer = $scope.currentPlayer === '1' ? '2' : '1';
      $scope.winner = data.winner;
      $scope.$apply();
    });
  }
]);

four.controller('InviteCtrl', ['$scope', '$location', 'IdService',
  function ($scope, $location, IdService) {
    $scope.inviteCode = IdService.generateRoomId();
    $scope.inviteLink = $location.absUrl().replace('invite', 'four/') + $scope.inviteCode;
  }
]);

four.factory('IdService', [function() {
  var createGuid = function () {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
      var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  };

  var generateRoomId = function () {
    return (Math.random() + 1).toString(36).substring(2,7);
  };

  var findOrCreateGuid = function() {
    if (!localStorage.getItem('playerGuid')) {
      localStorage.setItem('playerGuid', createGuid());
    }
    return localStorage.getItem('playerGuid');
  };

  return {
    getPlayerGuid: function() {
      return findOrCreateGuid();
    },
    generateRoomId: function() {
      return generateRoomId();
    }
  };
}]);

four.factory('SocketService', ['IdService', function(IdService) {
  var socket, getSocket = function() {
    if(!socket) {
      socket = io();
    }
    return socket;
  };

  return {
    emit: function(command, data) {
      data.playerGuid = IdService.getPlayerGuid();
      getSocket().emit(command, data);
    },
    on: function(command, callback) {
      getSocket().on(command, callback);
    }
  };
}]);
