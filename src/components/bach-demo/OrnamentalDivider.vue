<template>
  <div class="bach-demo__divider">
    <span class="divider__line"></span>
    <span class="divider__trefoil"></span>
    <span class="divider__line"></span>
  </div>
</template>

<style scoped>
.bach-demo__divider {
  display: flex;
  align-items: center;
  gap: 10px;
  width: 60%;
  padding: 0.2rem 0;
}

.divider__line {
  flex: 1;
  height: 1px;
  background: linear-gradient(90deg, transparent, rgba(100, 120, 170, 0.15), transparent);
}

.divider__line:first-child {
  background: linear-gradient(90deg, transparent, rgba(100, 120, 170, 0.15));
}

.divider__line:last-child {
  background: linear-gradient(90deg, rgba(100, 120, 170, 0.15), transparent);
}

.divider__trefoil {
  position: relative;
  width: 10px;
  height: 10px;
  flex-shrink: 0;
}

.divider__trefoil::before,
.divider__trefoil::after {
  content: '';
  position: absolute;
  width: 5px;
  height: 5px;
  border-radius: 50%;
  border: 1px solid rgba(100, 120, 170, 0.25);
}

.divider__trefoil::before {
  top: 0;
  left: 50%;
  transform: translateX(-50%);
}

.divider__trefoil::after {
  bottom: 0;
  left: 0;
  box-shadow: 6px 0 0 -1px transparent, 6px 0 0 0 rgba(100, 120, 170, 0.25);
}

@media (max-width: 768px) {
  .bach-demo__divider {
    width: 50%;
  }
}
</style>
