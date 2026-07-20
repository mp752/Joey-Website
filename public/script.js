

var sresponse = null
var sdata = null
var startTime = null


async function checkStreamerStatus(){
    const resultDiv = document.getElementById('statusResult');


    try {
        const response = await fetch('/api/status/');
        const data = await response.json();
        sresponse = await fetch('api/schedule/');
        sdata = await sresponse.json();
        startTime = new Date(sdata.startTime);
        const timeOptions = {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
            hour:"numeric",
            minute:"numeric",
            timeZoneName:"short"

        };
        const startString = startTime.toLocaleString(undefined, timeOptions)


        console.log(data);

        if (data.isLive){
            resultDiv.innerHTML = `
            <p>Joel is now live! He is now playing: ${data.game}<br>Next stream, ${sdata.title.replaceAll("Joel || ", "")}, will be at ${startString}<p>
            <br>
            `;

        } else {resultDiv.innerHTML = `
            <p>Joel is currently offline.<br>Next stream, ${sdata.title.replaceAll("Joel || ", "")}, will be at ${startString}<p>
            
            `;
        }
    } catch (error) {
        resultDiv.innerHTML = "Failed to load status :(";
        console.error("Error fetching stream data:", error);
    }
}

async function streamTimer(){
        const nowTime = new Date().getTime();
        var distance = startTime - nowTime;
        var days = Math.floor(distance / (1000 * 60 * 60 * 24));
        var hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        var minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        var seconds = Math.floor((distance % (1000 * 60)) / 1000);

        document.getElementById('timer').innerHTML = `
        <p>${days}:${String(hours).padStart(2, '0')}:${String(minutes).padStart(2,'0')}:${String(seconds).padStart(2,'0')}</p>
        `
}


checkStreamerStatus();

setInterval(checkStreamerStatus, 1200000);

streamTimer();
setInterval(streamTimer, 1000)