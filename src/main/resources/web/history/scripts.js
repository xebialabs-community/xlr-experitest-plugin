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
  chart.setOption(getChartOptions());
  drawLegend();

  // construct chart options
  function getChartOptions() {
    return {
      grid: {
        bottom: 20,
      },
      tooltip: {
        trigger: 'item',
        padding: 15,
        formatter: function (params) {
          const { name, duration, status } = params.data;
          return `Name: ${name} <br>
                  Duration: ${getSeconds(duration)} sec<br>
                  Status: ${status}`;
        },
      },
      xAxis: {
        type: 'category',
        axisLabel: {
          show: false,
        },
      },
      yAxis: {
        type: 'value',
        axisLabel: {
          formatter: function (value) {
            return value;
          },
        },
        name: 'Duration (sec)',
        nameTextStyle: {
          fontWeight: 'bold',
        },
      },
      series: [
        {
          type: 'bar',
          barMinHeight: 10,
          data: constructData(response.data.data.rawData),
          label: {
            show: false,
          },
        },
      ],
    };
  }

  // construct formatted data
  function constructData() {
    const chartData = response.data.data.rawData
      .filter((test) => categories.includes(test.status))
      .map((test) => {
        const { status, name, test_id, duration } = test;
        return {
          name,
          value: getSeconds(duration || 0),
          itemStyle: {
            color: getBarColor(status),
          },
          status,
          duration,
          test_id,
        };
      });

    return _.orderBy(chartData, 'test_id', 'asc');
  }

  // convert milliseconds to seconds
  function getSeconds(milliseconds) {
    return Math.round(milliseconds / 1000);
  }

  // get bar color depending on status
  function getBarColor(status) {
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

  // draw legend items
  function drawLegend() {
    const legend = document.querySelector('.legend');

    function createLegend(status) {
      const legendItem = document.createElement('div');
      const legendIcon = document.createElement('div');
      const legendText = document.createElement('div');

      legendItem.classList.add('legend-item');
      legendIcon.classList.add('icon');
      legendText.classList.add('text');

      legendText.innerHTML = `<span>${status}</span>`;
      legendIcon.style.backgroundColor = getBarColor(status.toUpperCase());

      legendItem.appendChild(legendIcon);
      legendItem.appendChild(legendText);
      legend.appendChild(legendItem);

      addLegendItemEventListener(legendItem, status);
    }

    Object.values(categories).forEach(createLegend);
  }

  // filter by legend items
  function addLegendItemEventListener(item, status) {
    function filterDataByStatus(status) {
      if (categories.includes(status)) {
        categories.splice(categories.indexOf(status), 1);
      } else {
        categories.push(status);
      }

      chart.setOption(getChartOptions());
    }

    item.addEventListener('click', () => {
      filterDataByStatus(status);
      const icon = item.querySelector('.icon');
      const text = item.querySelector('.text');
      if (categories.includes(status)) {
        icon.style.backgroundColor = getBarColor(status.toUpperCase());
        text.style.color = 'black';
      } else {
        icon.style.backgroundColor = 'lightgrey';
        text.style.color = 'lightgrey';
      }
    });
  }

  chart.on('click', (params) => {
    const { test_id } = params?.data;
    test_id && window.open(`${response.data.data.instance}/reporter/#/test/${test_id}/project/${response.data.data.projectName}/`, '_blank');
  });

  window.addEventListener('resize', () => chart.resize());
}

window.addEventListener("xlrelease.load", () => {
  window.xlrelease.queryTileData((response) => initialize(response))
})