<template>
  <div class="review-archive-container">
    <div class="archive-header">
      <h2>审阅过往档案</h2>
      <p>查看和管理历史通报记录</p>
    </div>

    <div class="archive-content">
      <div class="coming-soon">
        <div class="icon">
          📋
        </div>
        <h3>功能开发中</h3>
        <p>过往档案审阅功能正在开发中，敬请期待。</p>
        <div class="feature-list">
          <h4>即将推出的功能：</h4>
          <ul>
            <li>📊 历史通报记录查询</li>
            <li>🔍 按时间范围筛选</li>
            <li>📈 数据统计与分析</li>
            <li>📤 报告导出功能</li>
            <li>✏️ 记录编辑与修改</li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// 暂时为空的组件，等待功能开发
</script>

<style scoped>
.review-archive-container {
  padding: 1rem;
  max-width: 800px;
  margin: 0 auto;
}

.archive-header {
  text-align: center;
  margin-bottom: 3rem;
}

.archive-header h2 {
  color: #333;
  font-size: 2rem;
  margin: 0 0 0.5rem 0;
}

.archive-header p {
  color: #666;
  font-size: 1rem;
  margin: 0;
}

.archive-content {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  min-height: 400px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.coming-soon {
  text-align: center;
  padding: 3rem 2rem;
}

.icon {
  font-size: 4rem;
  margin-bottom: 1rem;
}

.coming-soon h3 {
  color: #333;
  font-size: 1.5rem;
  margin: 0 0 1rem 0;
}

.coming-soon > p {
  color: #666;
  font-size: 1.1rem;
  margin: 0 0 2rem 0;
}

.feature-list {
  background: #f8f9fa;
  padding: 1.5rem;
  border-radius: 6px;
  text-align: left;
  max-width: 400px;
  margin: 0 auto;
}

.feature-list h4 {
  color: #333;
  font-size: 1rem;
  margin: 0 0 1rem 0;
  text-align: center;
}

.feature-list ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.feature-list li {
  padding: 0.5rem 0;
  color: #666;
  font-size: 0.95rem;
  border-bottom: 1px solid #e9ecef;
}

.feature-list li:last-child {
  border-bottom: none;
}

@media (max-width: 768px) {
  .feature-list {
    max-width: 100%;
  }

  .coming-soon {
    padding: 2rem 1rem;
  }
}
</style>