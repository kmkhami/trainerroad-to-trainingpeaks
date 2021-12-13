var url = "https://www.trainerroad.com/api/workoutdetails/" + document.location.href.split('/').pop().split('-')[0]

libId = 1801577

if (libId === undefined) {
	var libId = prompt("library", libId)
}

fetch(url, {credentials: "include"}).then(res => res.json())
.then(function (json) {
	

var structure = [],
	end = 0;

	testInterval = false;


	var intervalData = json.Workout.intervalData;

for (var i = 1; i < intervalData.length; i++) {
	if (intervalData[i].TestInterval) {
		testInterval = intervalData[i];
		break;
	}
}

for (var i = 1; i < intervalData.length; i++) {
	if (testInterval && testInterval.Name !== intervalData[i].Name) {
		if (intervalData[i].Start >= testInterval.Start && 
			intervalData[i].End <= testInterval.End) {
			continue;
		}
	}



	var ic = 'warmUp';
	if (i == 1) { ic = 'warmUp'; }
	else if (i === intervalData.length) { ic = 'coolDown' }
	else if (intervalData[i].StartTargetPowerPercent > 60) { ic = 'active'; } 	
	else { ic = 'rest'; }

//	console.log(intervalData[i]);

	if (intervalData[i].Name === 'Fake' && i === 1) {
		intervalData[i].Name = 'Warm up';
	} else if (intervalData[i].Name === 'Fake') {
		intervalData[i].Name = 'Recovery';
	}

	end = intervalData[i].End;

	structure.push ({ "type":"step", "length":{"value":1, "unit":"repetition"}, "steps":[ { "name":intervalData[i].Name, "length": {"value":intervalData[i].End - intervalData[i].Start, "unit":"second"}, "targets":[{"minValue":intervalData[i].StartTargetPowerPercent}], "intensityClass": ic } ], "begin":intervalData[i].Start, "end":intervalData[i].End }); 


	


}
var duration = parseInt(json.Workout.Details.Duration)/60;
var description = json.Workout.Details.WorkoutDescription;

description += "\n\nhttps://www.trainerroad.com/cycling/workouts/" + json.Workout.Details.Id;

var polyline = []; var lastPercent = 0;
for (var i = 1; i < intervalData.length; i++) {
	polyline.push([parseFloat(intervalData[i].Start/end), 0]);
	polyline.push([parseFloat(intervalData[i].Start/end), intervalData[i].StartTargetPowerPercent/100]);
	polyline.push([parseFloat(intervalData[i].End/end), intervalData[i].StartTargetPowerPercent/100]);
	lastPercent = intervalData[i].StartTargetPowerPercent/100;
}
polyline.push([1,	0]);
var data = {'exerciseLibraryId':libId ,'exerciseLibraryItemId': '','itemName': json.Workout.Details.WorkoutName ,'itemType':2 ,'workoutTypeId':2 ,'workoutType': '','distancePlanned': '','totalTimePlanned': duration ,'caloriesPlanned': parseInt(json.Workout.Details.Kj)*0.239006,'tssPlanned': json.Workout.Details.TSS ,'ifPlanned': parseInt(json.Workout.Details.IntensityFactor)/100 ,'velocityPlanned': '','energyPlanned': '','elevationGainPlanned': '','description': description ,'coachComments': '','exerciseLibraryItemFilters': '','code': '','structure': JSON.stringify({"structure":structure, "polyline": polyline,	"primaryLengthMetric":"duration",	"primaryIntensityMetric":"percentOfFtp"}),'fileAttachments': '','fromLegacy':false ,'iExerciseLibraryItemValue': '','exercises': '','attachmentFileInfos': '','isStructuredWorkout': '','libraryOwnerId': ''}
var TPcode = ("var data = " + JSON.stringify(data) + '; fetch("https://tpapi.trainingpeaks.com/exerciselibrary/v1/libraries/' + libId + '/items", { ' + `method: 'POST', body: JSON.stringify(data), credentials:"include",headers: {'Content-Type': 'application/json'}}).then(res => res.json()).then(console.log)`);


var str = '<textarea id="tr2tp" cols=100 rows=20 style="z-index: 15000; position: absolute; top: 20px; left: 50%; width: 50%; height: 20%; margin-left: -25%;">' + TPcode + '</textarea>'; document.body.insertAdjacentHTML( 'beforeend', str ); 

var repeat=true;
while (repeat) {
	if (document.getElementById('tr2tp').innerHTML) {
		repeat = false;
		setTimeout(function () {
			document.getElementById('tr2tp').select(); document.execCommand('copy'); 
			document.getElementById('tr2tp').outerHTMl='';
			alert('paste your clipboard into TrainingPeaks console')
		}, 1000);
	}
}


})
