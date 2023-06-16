class Time {
    constructor(hours, minutes, positive = true) {
        this.hours = hours || 0;
        this.minutes = minutes || 0;
        this.positive = positive;
    }

    static parse(timeString) {
        const [hours, minutes] = timeString.split(':').map(Number);
        return new Time(hours, minutes);
    }

    add(otherTime) {
        const totalMinutes = this.minutes + otherTime.minutes;
        const carryHours = Math.floor(totalMinutes / 60);
        const sumHours = this.hours + otherTime.hours + carryHours;
        const sumMinutes = totalMinutes % 60;

        return new Time(sumHours, sumMinutes);
    }

    subtract(otherTime) {
        const thisTotalMinutes = this.hours * 60 + this.minutes;
        const otherTotalMinutes = otherTime.hours * 60 + otherTime.minutes;
        const highestTime = Math.max(thisTotalMinutes, otherTotalMinutes);
        const lowestTime = Math.min(thisTotalMinutes, otherTotalMinutes);
        const totalMinutes = highestTime - lowestTime;
        let subtractHours = Math.floor(totalMinutes / 60);
        let subtractMinutes = Math.abs(totalMinutes % 60);
  
        return new Time(subtractHours, subtractMinutes, thisTotalMinutes === highestTime);
    }

    isZero() {
        return this.hours === 0 && this.minutes === 0;
    }

    toString() {
        const hours = Math.abs(this.hours)
        let minutes = Math.abs(this.minutes);
        const hoursString = minutes < 10 ? `0${hours}` : hours.toString();
        const minutesString = minutes < 10 ? `0${minutes}` : minutes.toString();
        const sign = this.positive ? '+' : '-';
        return `${sign}${hoursString}:${minutesString}`;
    }
}

function getBValueLabel(innerText) {
   const infoContainers = Array.from(document.querySelectorAll('b-label-value'))
   return infoContainers.find((el) => {
       return el.innerHTML.toLowerCase().includes(innerText);
   });
}

function getDaysWorked() {
    const daysWorkedString = getBValueLabel('days worked').querySelector('h6').innerText;

    const daysWorked = parseInt(daysWorkedString);
    if (getTodayWorkedTime().isZero()) {
        return daysWorked;
    } else {
        return daysWorked - 1;
    }
}

function getTotalWorkedTime() {
    const hoursWorkedString = getBValueLabel('hours worked').querySelector('h6').innerText;

    return Time.parse(hoursWorkedString);
}

function getTodayWorkedTime() {
    const hoursWorkedContainers = Array.from(document.querySelectorAll('[col-id="totalHoursDisplay"]'));
    const hoursWorkedTodayString = hoursWorkedContainers[1].innerText;

    return Time.parse(hoursWorkedTodayString);
}

function getTotalWorkedTimeUntilYesterday() {
    return getTotalWorkedTime().subtract(getTodayWorkedTime());
}

function getOvertime() {
    return getTotalWorkedTimeUntilYesterday().subtract(new Time(getDaysWorked() * 8, 0));
}

function deletePreviousOvertime() {
    document.getElementById('overtime')?.remove();
}

function appendOvertime() {
    deletePreviousOvertime();
    const overtime = document.createElement('div');
    const summaryContainer = document.querySelector('b-summary-insights');
    overtime.id = 'overtime';
    overtime.innerHTML = getOvertime().toString() + '<br>Overtime';
    overtime.style.fontSize = '16px';
    summaryContainer.appendChild(overtime);
}

function waitForPageRender() {
    let resolvePromise;
    const promise = new Promise(resolve => { resolvePromise = resolve });
    const interval = setInterval(() => {
        if (getBValueLabel('hours worked')) {
            resolvePromise();
            clearInterval(interval);
        }
    }, 1000);
    return promise;
}

function run() {
    appendOvertime();
}

(function() {
    'use strict';

    waitForPageRender().then(run);
})();
