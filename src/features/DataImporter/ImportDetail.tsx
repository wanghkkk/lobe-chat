'use client';

import { Modal } from '@lobehub/ui';
import { Button, Radio, Space, Table, Typography } from 'antd';
import { createStyles } from 'antd-style';
import { Info } from 'lucide-react';
import { useState } from 'react';
import { Flexbox } from 'react-layout-kit';

import { ExportDatabaseData } from '@/types/export';

const { Text } = Typography;

const getNonEmptyTables = (data: ExportDatabaseData) => {
  const result = [];

  for (const [key, value] of Object.entries(data.data)) {
    if (Array.isArray(value) && value.length > 0) {
      result.push({
        count: value.length,
        name: key,
      });
    }
  }

  return result;
};

const getTotalRecords = (tables: { count: number; name: string }[]): number => {
  return tables.reduce((sum, table) => sum + table.count, 0);
};

const useStyles = createStyles(({ token, css }) => {
  return {
    duplicateAlert: css`
      background-color: ${token.colorWarningBg};
      border: 1px solid ${token.colorWarningBorder};
      border-radius: ${token.borderRadiusLG}px;
      padding: ${token.paddingMD}px;
      margin-top: ${token.marginMD}px;
    `,
    duplicateDescription: css`
      color: ${token.colorTextSecondary};
      font-size: ${token.fontSizeSM}px;
      margin-top: ${token.marginXS}px;
    `,
    duplicateOptions: css`
      margin-top: ${token.marginSM}px;
    `,
    duplicateTag: css`
      background-color: ${token.colorWarningBg};
      border-color: ${token.colorWarningBorder};
      color: ${token.colorWarning};
    `,
    hash: css`
      color: ${token.colorTextTertiary};
      font-size: 12px;
      font-family: ${token.fontFamilyCode};
    `,
    infoIcon: css`
      color: ${token.colorTextSecondary};
    `,
    modalContent: css`
      padding: ${token.paddingMD}px 0;
    `,
    successIcon: css`
      color: ${token.colorSuccess};
    `,
    tableContainer: css`
      border: 1px solid ${token.colorBorderSecondary};
      border-radius: ${token.borderRadiusLG}px;
      overflow: hidden;
    `,
    tableName: css`
      font-family: ${token.fontFamilyCode};
    `,
    warningIcon: css`
      color: ${token.colorWarning};
    `,
  };
});

interface ImportPreviewModalProps {
  importData: ExportDatabaseData;
  onCancel?: () => void;
  onConfirm?: (overwriteExisting: boolean) => void;
  onOpenChange: (open: boolean) => void;
  open: boolean;
}

const ImportPreviewModal = ({
  open = true,
  onOpenChange = () => {},
  onConfirm = () => {},
  onCancel = () => {},
  importData,
}: ImportPreviewModalProps) => {
  const { styles } = useStyles();
  const [duplicateAction, setDuplicateAction] = useState<string>('skip');
  const tables = getNonEmptyTables(importData);
  const totalRecords = getTotalRecords(tables);

  // 表格列定义
  const columns = [
    {
      dataIndex: 'name',
      key: 'name',
      render: (text: string) => <div className={styles.tableName}>{text}</div>,
      title: '表名',
    },
    {
      dataIndex: 'count',
      key: 'count',
      title: '记录数',
    },
  ];

  const handleConfirm = () => {
    onConfirm(duplicateAction === 'overwrite');
    onOpenChange(false);
  };

  return (
    <Modal
      footer={[
        <Button
          key="cancel"
          onClick={() => {
            onOpenChange(false);
            onCancel();
          }}
        >
          取消
        </Button>,
        <Button key="confirm" onClick={handleConfirm} type="primary">
          确认导入
        </Button>,
      ]}
      onCancel={() => onOpenChange(false)}
      open={open}
      title="导入数据预览"
      width={700}
    >
      <div className={styles.modalContent}>
        <Flexbox gap={16}>
          <Flexbox gap={4}>
            <Flexbox align="center" horizontal justify="space-between" width="100%">
              <Flexbox align="center" gap={8} horizontal>
                <Info className={styles.infoIcon} size={16} />
                <Text strong>总计将导入 {totalRecords} 条记录</Text>
              </Flexbox>
              <Flexbox horizontal>
                <Text type="secondary">{tables.length}个表</Text>
              </Flexbox>
            </Flexbox>
            <Flexbox className={styles.hash} gap={4} horizontal>
              Hash: <span>{importData.schemaHash}</span>
            </Flexbox>
          </Flexbox>

          <div className={styles.tableContainer}>
            <Table
              columns={columns}
              dataSource={tables}
              pagination={false}
              rowKey="name"
              scroll={{ y: 350 }}
              size="small"
            />
          </div>

          <Flexbox>
            重复数据处理方式：
            <div className={styles.duplicateOptions}>
              <Radio.Group
                onChange={(e) => setDuplicateAction(e.target.value)}
                value={duplicateAction}
              >
                <Space>
                  <Radio value="skip">跳过</Radio>
                  <Radio value="overwrite">覆盖</Radio>
                </Space>
              </Radio.Group>
            </div>
            <div className={styles.duplicateDescription}>
              {duplicateAction === 'skip'
                ? '选择跳过将仅导入不重复的数据，保留现有数据不变。'
                : '选择覆盖将使用导入数据替换系统中具有相同 ID 的现有记录。'}
            </div>
          </Flexbox>
        </Flexbox>
      </div>
    </Modal>
  );
};

export default ImportPreviewModal;
