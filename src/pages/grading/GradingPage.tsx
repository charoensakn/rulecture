import { Button, Col, Divider, message, Row, Typography } from 'antd';
import { Reducer, useEffect, useReducer, useRef, useState } from 'react';
import { AppLayout } from '../../layouts/AppLayout';
import { Answer, GradingService, Key, KeyType, ReferencedRow } from '../../services/grading';
import './GradingPage.less';
import { Step1 } from './Step1';
import { FileStatus, Step2 } from './Step2';
import { Stat, Step3 } from './Step3';
import { Step4 } from './Step4';

const { Title } = Typography;

const STEPS = ['นำเข้าเฉลย', 'นำเข้าคำตอบ', 'ตั้งค่าเกรด', 'ผลลัพธ์'];

export function GradingPage() {
  const [keys, setKeys] = useState([] as Key[]);
  const [fileAnswers, setFileAnswers] = useState([] as FileStatus[]);
  const [stat, setStat] = useState({} as Stat);
  const [oldScore, setOldScore] = useState(0);
  const [myReferencedTable, setMyReferencedTable] = useState([] as ReferencedRow[]);
  const [answers, setAnswers] = useState([] as Answer[]);

  const gradingService = useRef(new GradingService());

  useEffect(() => {
    const timer = setInterval(() => {
      let next: FileStatus | null = null;
      for (const f of fileAnswers) {
        if (f.loaded === false && f.loading === false && !next) {
          next = f;
        } else if (f.loading) {
          return;
        }
      }
      if (next) {
        next.loading = true;
        setFileAnswers([...fileAnswers]);
        (async (file: FileStatus) => {
          try {
            await gradingService.current.addAnswer(file.input);
          } catch (error: any) {
            console.log('[grading] cannot add answer:', error);
            file.error = 'เกิดความผิดพลากในการนำเข้าข้อมูล';
          } finally {
            file.loaded = true;
            file.loading = false;
            setFileAnswers([...fileAnswers]);
          }
        })(next);
      }
    }, 500);
    return () => clearInterval(timer);
  });

  const handleKeyFile = (input: string) => {
    gradingService.current.addKey(input);
    setKeys(gradingService.current.listKeys());
  };

  const handleKeyChange = (key: string, type: KeyType) => {
    gradingService.current.setKeyType(key, type);
    setKeys(gradingService.current.listKeys());
  };

  const handleAnswerFile = (file: FileStatus) => {
    setFileAnswers((prevAnswer) => [...prevAnswer, file]);
  };

  const handleMaxScore = (maxScore?: number) => {
    if (stat.maxscore && (!maxScore || maxScore === stat.maxscore)) {
      return;
    }
    const g = gradingService.current;
    g.stat(maxScore);
    if (!oldScore) {
      setOldScore(g.maxScore);
    }
    setMyReferencedTable(g.criterionReferencedTable());
    setStat({
      oldscore: oldScore ? oldScore : g.maxScore,
      maxscore: g.maxScore,
      coefficient: g.coefficient,
      min: g.min,
      max: g.max,
      range: g.range,
      mean: g.mean,
      median: g.median,
      mode: g.mode,
      sd: g.standardDeviation,
      variance: g.variance,
      freqReferencedTable: g.freqReferencedTable(),
      normReferencedTable: g.normReferencedTable(),
      criterianReferencedTable: g.criterionReferencedTable(),
    });
    if (maxScore) {
      message.success('ปรับค่าคะแนนสูงสุดใหม่เสร็จแล้ว');
    }
  };

  const handleMinChange = (index: number, min: number, forced = true) => {
    if (index < 0 || index >= myReferencedTable.length || min < 0) {
      return;
    }
    const current = myReferencedTable[index];
    if (current && (forced || current.min < min)) {
      current.min = min;
      if (current.max < min) {
        current.max = min;
        handleMinChange(index - 1, current.max + 1, false);
      }
      handleMaxChange(index + 1, current.min - 1, false);
    }
    if (forced) {
      setMyReferencedTable([...myReferencedTable]);
    }
  };

  const handleMaxChange = (index: number, max: number, forced = true) => {
    if (index < 0 || index >= myReferencedTable.length || max < 0) {
      return;
    }
    const current = myReferencedTable[index];
    if (current && (forced || current.max > max)) {
      current.max = max;
      if (current.min > max) {
        current.min = max;
        handleMaxChange(index + 1, current.min - 1, false);
      }
      handleMinChange(index - 1, current.max + 1, false);
    }
    if (forced) {
      setMyReferencedTable([...myReferencedTable]);
    }
  };

  const handleUseNorm = () => {
    setMyReferencedTable([...gradingService.current.normReferencedTable()]);
    message.success('ปรับค่าตารางเป็นแบบอิงกลุ่มเสร็จแล้ว');
  };

  const handleUseCriterian = () => {
    setMyReferencedTable([...gradingService.current.criterionReferencedTable()]);
    message.success('ปรับค่าตารางเป็นแบบอิงเกณฑ์เสร็จแล้ว');
  };

  const handleApplyGrade = () => {
    setMyReferencedTable([...gradingService.current.applyGrade(myReferencedTable)]);
    message.success('คำนวณค่าความถี่ใหม่เสร็จแล้ว');
  };

  const reducer: Reducer<number, string> = (state, action) => {
    if (action === 'next') {
      switch (state) {
        case 0:
          if (keys.filter((k) => k.t === KeyType.PRIMARY).length > 0) {
            return state + 1;
          }
          if (keys.length === 0) {
            message.error('ไม่พบข้อมูลเฉลย กรุณาวางไฟล์เฉลยก่อนดำเนินการขั้นตอนถัดไป');
          } else {
            message.error('กรุณาเลือกฟิลด์หลักสำหรับเชื่อมโยงอย่างน้อยหนึ่งฟิลด์');
          }
          return state;
        case 1:
          let loaded = 0;
          let success = 0;
          for (const ans of fileAnswers) {
            if (ans.loaded) loaded++;
            if (ans.loaded && !ans.error) success++;
          }
          if (loaded !== fileAnswers.length) {
            message.loading('โปรแกรมกำลังประมวลผลไฟล์ กรุณารอจนกว่าโปรแกรมประมวลเสร็จแล้วจึงกดขั้นตอนถัดไป');
            return state;
          }
          if (success === 0) {
            message.error('ไม่พบข้อมูลคำตอบ กรุณาวางไฟล์คำตอบก่อนดำเนินการขั้นตอนถัดไป');
            return state;
          }
          handleMaxScore();
          return state + 1;
        case 2:
          setMyReferencedTable([...gradingService.current.applyGrade(myReferencedTable)]);
          setAnswers(gradingService.current.listAnswers());
          return state + 1;
        default:
          return state + 1;
      }
    } else if (action === 'prev') {
      return state - 1;
    }
    throw new Error('no step found');
  };

  const [step, dispatch] = useReducer(reducer, 0);

  let stepChild: JSX.Element | null = null;
  switch (step) {
    case 0:
      stepChild = <Step1 keys={keys} onFile={handleKeyFile} onKeyChange={handleKeyChange} />;
      break;
    case 1:
      stepChild = <Step2 fileList={fileAnswers} onFile={handleAnswerFile} />;
      break;
    case 2:
      stepChild = (
        <Step3
          stat={stat}
          myTable={myReferencedTable}
          onMaxScore={handleMaxScore}
          onMinChange={handleMinChange}
          onMaxChange={handleMaxChange}
          onUseNorm={handleUseNorm}
          onUseCriterian={handleUseCriterian}
          onApplyGrade={handleApplyGrade}
        />
      );
      break;
    case 3:
      stepChild = (
        <Step4 refTable={myReferencedTable} answers={answers} onSave={() => gradingService.current.export(true)} />
      );
      break;
  }

  return (
    <AppLayout className='GradingPage'>
      <Row gutter={[25, 25]}>
        <Col xs={24}>
          <Title level={4}>โปรแกรมคำนวณคะแนนข้อสอบปรนัยที่สร้างด้วย Google Form [BETA]</Title>
        </Col>
        <Col xs={24}>{stepChild}</Col>
        <Col xs={24}>
          <Divider className='GradingPage__Divider' />
        </Col>
        <Col className='GradingPage__Navigator' xs={24}>
          <Button disabled={step <= 0} onClick={() => dispatch('prev')}>
            {STEPS[step - 1 >= 0 ? step - 1 : step]}
          </Button>
          <div className='GradingPage__Navigator__Space'></div>
          <Button type='primary' disabled={step >= STEPS.length - 1} onClick={() => dispatch('next')}>
            {STEPS[step + 1 < STEPS.length ? step + 1 : step]}
          </Button>
        </Col>
      </Row>
    </AppLayout>
  );
}
