import { Card, Col, Radio, Row, Slider, Space, Switch, Typography } from 'antd';
import useBreakpoint from 'antd/lib/grid/hooks/useBreakpoint';
import React, { useContext } from 'react';
import { useTranslation } from 'react-i18next';
import { SettingContext } from '../contexts/setting';
import { AppLayout } from '../layouts/AppLayout';
import './SettingPage.less';

const { Text, Title } = Typography;

export function SettingPage() {
  const {
    setting,
    changeLanguage,
    changeRounding,
    changeDarkMode,
    changeAutoHide,
    changeAutoHideSensitivity,
    changePersistence,
    changeDarkModeFastSwitch,
    changeLanguageFastSwitch,
  } = useContext(SettingContext);
  const { t } = useTranslation();
  const screens = useBreakpoint();

  return (
    <AppLayout className="SettingPage">
      <Title level={4}>{t('setting_general')}</Title>
      <Card>
        <Row>
          <Col>{t('language')}</Col>
          <Col>
            <Radio.Group value={setting.language} onChange={(e) => changeLanguage(e.target.value)}>
              <Radio.Button value="en">ENG</Radio.Button>
              <Radio.Button value="th">ไทย</Radio.Button>
            </Radio.Group>
          </Col>
        </Row>
        {screens.sm && (
          <Row>
            <Col>{t('setting_languagefast')}</Col>
            <Col>
              <Switch
                defaultChecked={setting.languageFastSwitch}
                onChange={(checked) => changeLanguageFastSwitch(checked)}
              />
            </Col>
          </Row>
        )}
        <Row>
          <Col xs={24} sm={6}>
            {t('roundingoff')}
          </Col>
          <Col className={screens.sm ? '' : 'SettingPage__Col--left'} xs={24} sm={18}>
            <Radio.Group value={setting.rounding} onChange={(e) => changeRounding(e.target.value)}>
              <Space direction={screens.sm ? 'horizontal' : 'vertical'}>
                <Radio value={2}>{t('setting_round2')}</Radio>
                <Radio value={4}>{t('setting_round4')}</Radio>
                <Radio value={0}>{t('setting_roundnone')}</Radio>
              </Space>
            </Radio.Group>
          </Col>
        </Row>
        {window.matchMedia('(display-mode: standalone)').matches && (
          <Row>
            <Col>{t('setting_persistence')}</Col>
            <Col>
              <Switch defaultChecked={setting.persistence} onChange={(checked) => changePersistence(checked)} />
            </Col>
          </Row>
        )}
      </Card>
      <Title level={4}>{t('setting_ui')}</Title>
      <Card>
        <Row>
          <Col>{t('setting_darkmode')}</Col>
          <Col>
            <Switch defaultChecked={setting.darkMode} onChange={(checked) => changeDarkMode(checked)} />
          </Col>
        </Row>
        {screens.sm && (
          <Row>
            <Col>{t('setting_darkmodefast')}</Col>
            <Col>
              <Switch
                defaultChecked={setting.darkModeFastSwitch}
                onChange={(checked) => changeDarkModeFastSwitch(checked)}
              />
            </Col>
          </Row>
        )}
        <Row>
          <Col>{t('setting_autohide')}</Col>
          <Col>
            <Switch defaultChecked={setting.autoHide} onChange={(checked) => changeAutoHide(checked)} />
          </Col>
        </Row>
        <Row>
          <Col xs={14}>
            <Text disabled={!setting.autoHide}>{t('setting_autohide_sense')}</Text>
          </Col>
          <Col xs={10}>
            <Slider
              disabled={!setting.autoHide}
              step={0.1}
              max={10}
              value={setting.autoHideSensitivity}
              onChange={(value) => changeAutoHideSensitivity(value)}
            />
          </Col>
        </Row>
      </Card>
    </AppLayout>
  );
}
