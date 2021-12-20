import { useState, useEffect } from 'react'
import { Form, Select, InputNumber, Switch, Slider, Button, Card } from 'antd'
// import * as echarts from 'echarts/core';
// import {
//   TitleComponent,
//   ToolboxComponent,
//   TooltipComponent,
//   GridComponent,
//   LegendComponent
// } from 'echarts/components';
// import { LineChart } from 'echarts/charts';
// import { UniversalTransition } from 'echarts/features';
// import { CanvasRenderer } from 'echarts/renderers';
import * as echarts from 'echarts';
// echarts.use([
//   TitleComponent,
//   ToolboxComponent,
//   TooltipComponent,
//   GridComponent,
//   LegendComponent,
//   LineChart,
//   CanvasRenderer,
//   UniversalTransition
// ]);

const { Option } = Select


import styles from '../styles/home.module.css'




const Charts = ({ name, data, xAxis }) => {
  const option = {
    title: {
      text: ''
    },
    tooltip: {
      trigger: 'axis'
    },
    legend: {
      data: []
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true
    },
    toolbox: {
      feature: {
        saveAsImage: {}
      }
    },
    xAxis: {
      type: 'category',
      data: []
    },
    yAxis: {
      type: 'value'
    },
    series: []
  };

  useEffect(() => {
    if (name) {
      var chartDom = document.getElementById(name);
      var myChart = echarts.init(chartDom);
      const keys = Object.keys(data)
      const result = keys.map(item => {
        return {
          name: item,
          type: 'line',
          markPoint: {
            data: [
              { type: 'max', name: 'Max' },
              { type: 'min', name: 'Min' }
            ]
          },
          data: data[item]
        }
      })

      Object.assign(option, {
        title: {
          text: name
        },
        legend: {
          data: keys,
        },
        xAxis: {
          data: xAxis
        },
        series: result
      })

      option && myChart.setOption(option);
    }
  }, [name])

  return (
    <div id={name} key={name} style={{
      width: '100%',
      height: '500px'
    }}></div>
  )
}


export default function Home({ data }) {
  const [timeStamps, setTimeStamps] = useState([])
  const [curTimeStamp, setCurTimeStamp] = useState('')
  const [fetchData, setFetchData] = useState({})
  const [curTimeChartData, setCurTimeChartData] = useState(null)


  const dealWithDataCategory = () => {
    const chartObj = fetchData[curTimeStamp]
    if (!chartObj) {
      setCurTimeChartData(null)
  
      return
    }
    const result = {}

    const { perfor } = chartObj  //  ['123456-1639725812027']
    const perforKeys = Object.keys(perfor)  // [1, 2, 3, 4, 5, 6]
    result['keys'] = perforKeys
    var info = {}
    perforKeys.forEach(el => {
      const perforItem = perfor[el] // { Memory: {}, NetWork: {} ...}
      // Memory NetWork Battery ...
      Object.keys(perforItem).forEach(nl => {
        if (!info[nl]) {
          info[nl] = {}
        }
        const leafNode = perforItem[nl] // { totalPrivateDirty: 323, totalPss: 23232 }
        Object.keys(leafNode).forEach(gl => {
          if(Object.prototype.toString.call(leafNode[gl]) === '[object Number]') {
            if (!info[nl][gl]) {
              info[nl][gl] = []
            }
            info[nl][gl] = [...info[nl][gl], leafNode[gl]]
          }
        })
      })
    })
    result['data'] = info

    console.log(info);
    setCurTimeChartData(result)
  }
  useEffect(() => {
    setFetchData(data)
    const keys = Object.keys(data)
    setTimeStamps(keys)
    setCurTimeStamp(keys[0])
  }, [data])

  useEffect(() => {
    dealWithDataCategory()
  }, [curTimeStamp])


  return (
    <div className={styles.container}>
      <div style={{ marginBottom: '20px' }}>
        <Select placeholder='请选择' onChange={setCurTimeStamp} value={curTimeStamp} allowClear>
          {
            timeStamps && timeStamps.map(item => <Option key={item} value={item}>{item}</Option>)
          }
        </Select>
      </div>


      {
        curTimeChartData && Object.keys(curTimeChartData.data).map(item2 => {
          return (
            <Card key={`card-${item2}`} style={{ marginBottom: '20px' }}>
              <Charts name={item2} data={curTimeChartData.data[item2]} xAxis={curTimeChartData.keys}></Charts>
            </Card>
          )
        })
      }

    </div>
  )
}

export async function getServerSideProps() {
  const res = await fetch('http://10.30.30.59:3000/api/whyLog/getAllData')
  const data = await res.json()
  return {
    props: {
      data
    }
  }
}

