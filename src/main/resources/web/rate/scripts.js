/*
 * Copyright 2020 XEBIALABS
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

function initialize(response) {
  const chart = echarts.init(document.getElementById('main'));
  const statuses = { failed: 'Failed', incomplete: 'Incomplete', passed: 'Passed', skipped: 'Skipped' };
  const categories = Object.values(statuses);
  let rawData = response.data.data.rawData;
  let timePeriods;
  chart.setOption(getChartOptions());
  drawTimePeriod();

  // construct chart options
  function getChartOptions() {
    return {
      tooltip: {
        trigger: 'item',
        padding: 15,
        formatter: function (params) {
          const { percent, value, name } = params;
          return `${name} <br>
          Total: ${value} <br>
          Percentage: ${percent}% <br>`;
        },
        textStyle: {
          fontSize: '16',
        },
      },
      series: [
        {
          type: 'pie',
          radius: '50%',
          center: ['50%', '50%'],
          selectedMode: 'single',
          data: constructData(),
          label: {
            textStyle: {
              fontSize: '21',
            },
            color: 'black',
          },
          emphasis: {
            itemStyle: {
              shadowBlur: 10,
              shadowOffsetX: 0,
              shadowColor: 'rgba(0, 0, 0, 0.5)',
            },
          },
        },
      ],
      legend: {
        orient: 'horizontal',
        bottom: 'bottom',
        data: constructData(),
        textStyle: {
          fontSize: '18',
        },
      },
    };
  }

  // construct/format data
  function constructData() {
    let categorisedData = { Failed: [], Incomplete: [], Passed: [], Skipped: [] };

    const usefulData = rawData
      .filter((test) => categories.includes(test.status))
      .map((test) => {
        categorisedData[test.status].push(test);
        return test;
      });

    const chartData = Object.keys(categorisedData).map((category) => {
      const value = categorisedData[category].length;

      return {
        name: category,
        value,
        itemStyle: {
          color: getPieceColor(category),
        },
        status,
      };
    });

    // gather min and max times
    const times = usefulData.map((item) => moment(item.start_time));
    timePeriods = { min: moment.min(times).format('YYYY-MM-DD'), max: moment.max(times).format('YYYY-MM-DD') };

    return chartData;
  }

  // set bar color depending on status
  function getPieceColor(status) {
    switch (status.toLowerCase()) {
      case 'failed':
        return 'red';
      case 'skipped':
      case 'incomplete':
        return 'grey';
      case 'passed':
        return 'green';
    }
  }

  // draw time period item
  function drawTimePeriod() {
    const legendTimePeriod = document.querySelector('.legend .time-period');
    legendTimePeriod.innerHTML = `Time Period: ${timePeriods.min} ${timePeriods.min !== timePeriods.max ? `to ${timePeriods.max}` : ''}`;
  }

  window.addEventListener('resize', () => chart.resize());
}

window.addEventListener("xlrelease.load", () => {
  window.xlrelease.queryTileData((response) => initialize(response))
})