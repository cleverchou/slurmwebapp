angular.module('RDash').service('Jobs', ['$q', '$rootScope', 'User', Jobs]);

function Jobs($q, $rootScope, User) {
    this.jobStateCodes = {
        // https://computing.llnl.gov/linux/slurm/squeue.html#SECTION_JOB STATE CODES
        'CA' : {
            completeName : "Annulé",
            description : "Le job à été explicitement annulé",
            icon :{
                name : "ban",
                class : "text-danger"
            }
        },
        'CD' : {
            completeName : "Terminé",
            description : "Le job est terminé",
            icon :{
                name : "check",
                class : "text-success"
            }
        },
        'CF' : {
            completeName : "Configuration",
            description : "Le job est en cours de démarrage",
            icon :{
                name : "hourglass-start",
                class : "text-success"
            }
        },
        'CG' : {
            completeName : "Achevement",
            description : "Le job est en train de terminé",
            icon :{
                name : "check",
                class : "text-warning"
            }
        },
        'F' : {
            completeName : "Echec",
            description : "Le job a terminé avec un code de sortie non nul",
            icon :{
                name : "times",
                class : "text-danger"
            }
        },
        'NF' : {
            completeName : "Défaillance",
            description : "Le job est prématurément terminé pour défaillance d'un noeud",
            icon :{
                name : "bolt",
                class : "text-danger"
            }
        },
        'PD' : {
            completeName : "Attente",
            description : "Le job est en attente d'allocation de ressources",
            icon :{
                name : "hourglass-start",
                class : "gray"
            }
        },
        'PR' : {
            completeName : "Préempté",
            description : "Le job terminé en raison de préemption",
            icon :{
                name : "eject",
                class : "text-danger"
            }
        },
        'R' : {
            completeName : "En cours",
            description : "Le job a actuellement une allocation",
            icon :{
                name : "play",
                class : "text-success"
            }
        },
        'S' : {
            completeName : "Suspendu",
            description : "Le job a été suspendu",
            icon :{
                name : "pause",
                class : "gray"
            }
        },
        'TO' : {
            completeName : "Temps écoulé",
            description : "Le job a atteint sa limite de temps",
            icon :{
                name : "clock-o",
                class : "text-danger"
            }
        }
    };
    this.subscribed = false;
    var that = this;
    this.deferred = false;

    this.subscribe = function() {

        if(!this.subscribed){
            this.deferred = $q.defer();
            User.operation({verb:"subscribe", object:"jobs"}).then(
                // Success
                function(successMessage){
                    that.deferred.resolve(successMessage);
                },
                // Error
                function(err){
                    that.deferred.reject(err);
                    that.subscribed = false;
                }
            );
            User.socket.on('publish jobs', function(data) {
                that.deferred.notify(data);
            });
            this.subscribed = true;
        }
        console.log(this.deferred);
        return this.deferred.promise;
    };

    this.unsubscribe = function() {
        if(this.subscribed){
            // Unsubscribe
            User.socket.emit("unsubscribe jobs");
            User.socket.removeAllListeners("publish jobs");
            that.deferred.reject("end");
            this.subscribed = false;
        }
    };
}