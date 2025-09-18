# Existing Component Enhancement Plan for Hybrid Strands + User Override

## 🎯 Overview
This document outlines specific changes needed to our existing components to support the hybrid approach where users can override Strands model-driven behavior when needed.

## 🔧 Component-by-Component Changes

### 1. **StrandsAgentConfigDialog.tsx Enhancement**

#### **Current State Analysis:**
- ✅ Basic agent configuration (name, model, system prompt)
- ✅ Reasoning pattern selection
- ✅ Context management settings
- ✅ Tool selection
- ❌ No control mode selection
- ❌ No user override capabilities
- ❌ No hybrid configuration

#### **Required Changes:**

```typescript
// Enhanced interface extending existing
interface EnhancedStrandsAgentConfig extends StrandsOllamaAgent {
  // New: Control mode selection
  controlMode: 'model-driven' | 'user-defined' | 'hybrid';
  
  // New: User override configuration
  userOverrides?: {
    explicitBehavior?: {
      type: 'script' | 'api-call' | 'data-transform' | 'conditional-logic';
      configuration: any;
      inputSchema?: JSONSchema;
      outputSchema?: JSONSchema;
    };
    conditionalOverrides?: ConditionalOverride[];
    fallbackStrategy: 'revert-to-model' | 'fail' | 'retry';
  };
  
  // New: Hybrid configuration
  hybridConfig?: {
    controlStrategy: 'user-first' | 'model-first' | 'context-dependent';
    transitionTriggers: TransitionTrigger[];
  };
}

// Enhanced component structure
const EnhancedStrandsAgentConfigDialog = ({ isOpen, onClose, onSave, agent, mode }) => {
  // Existing state + new control mode state
  const [controlMode, setControlMode] = useState<'model-driven' | 'user-defined' | 'hybrid'>('model-driven');
  const [userOverrides, setUserOverrides] = useState<any>(null);
  const [hybridConfig, setHybridConfig] = useState<any>(null);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {mode === 'create' ? 'Create Strands Agent' : 'Edit Strands Agent'}
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="basic" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="basic">Basic Config</TabsTrigger>
            <TabsTrigger value="control">Control Mode</TabsTrigger>
            <TabsTrigger value="overrides">User Overrides</TabsTrigger>
            <TabsTrigger value="hybrid">Hybrid Settings</TabsTrigger>
          </TabsList>

          {/* Existing Basic Configuration Tab */}
          <TabsContent value="basic">
            {/* Keep existing basic configuration UI */}
            <ExistingBasicConfigSection />
          </TabsContent>

          {/* New: Control Mode Selection Tab */}
          <TabsContent value="control">
            <ControlModeSelectionSection 
              value={controlMode}
              onChange={setControlMode}
            />
          </TabsContent>

          {/* New: User Overrides Tab */}
          <TabsContent value="overrides">
            <UserOverridesSection 
              enabled={controlMode !== 'model-driven'}
              config={userOverrides}
              onChange={setUserOverrides}
            />
          </TabsContent>

          {/* New: Hybrid Configuration Tab */}
          <TabsContent value="hybrid">
            <HybridConfigurationSection 
              enabled={controlMode === 'hybrid'}
              config={hybridConfig}
              onChange={setHybridConfig}
            />
          </TabsContent>
        </Tabs>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSave}>
            {mode === 'create' ? 'Create Agent' : 'Save Changes'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
```

#### **New UI Components Needed:**

```typescript
// Control Mode Selection Component
const ControlModeSelectionSection = ({ value, onChange }) => (
  <div className="space-y-6">
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <ControlModeCard
        mode="model-driven"
        title="Model-Driven (Strands Default)"
        description="Agent uses AI reasoning to decide actions dynamically"
        icon={Brain}
        selected={value === 'model-driven'}
        onClick={() => onChange('model-driven')}
        features={[
          'Autonomous decision making',
          'Dynamic tool selection',
          'Adaptive behavior',
          'Context-aware reasoning'
        ]}
      />
      
      <ControlModeCard
        mode="user-defined"
        title="User-Defined Behavior"
        description="Explicit rules and actions defined by user"
        icon={Settings}
        selected={value === 'user-defined'}
        onClick={() => onChange('user-defined')}
        features={[
          'Predictable behavior',
          'Explicit control',
          'Custom logic',
          'Deterministic outcomes'
        ]}
      />
      
      <ControlModeCard
        mode="hybrid"
        title="Hybrid Approach"
        description="Combine AI intelligence with user control"
        icon={Zap}
        selected={value === 'hybrid'}
        onClick={() => onChange('hybrid')}
        features={[
          'Best of both worlds',
          'Conditional overrides',
          'Fallback strategies',
          'Context-dependent control'
        ]}
      />
    </div>
  </div>
);

// User Overrides Configuration
const UserOverridesSection = ({ enabled, config, onChange }) => {
  if (!enabled) {
    return (
      <div className="text-center py-8 text-gray-500">
        <Settings className="w-12 h-12 mx-auto mb-4 opacity-50" />
        <p>User overrides are only available in User-Defined or Hybrid modes.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Behavior Type Selection */}
      <FormField label="Override Behavior Type">
        <Select value={config?.explicitBehavior?.type} onValueChange={handleBehaviorTypeChange}>
          <SelectTrigger>
            <SelectValue placeholder="Select behavior type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="script">Custom Script</SelectItem>
            <SelectItem value="api-call">API Call</SelectItem>
            <SelectItem value="data-transform">Data Transformation</SelectItem>
            <SelectItem value="conditional-logic">Conditional Logic</SelectItem>
          </SelectContent>
        </Select>
      </FormField>

      {/* Dynamic Configuration Based on Type */}
      <DynamicBehaviorConfiguration 
        type={config?.explicitBehavior?.type}
        config={config?.explicitBehavior?.configuration}
        onChange={handleBehaviorConfigChange}
      />

      {/* Fallback Strategy */}
      <FormField label="Fallback Strategy">
        <RadioGroup value={config?.fallbackStrategy} onValueChange={handleFallbackChange}>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="revert-to-model" id="revert" />
            <Label htmlFor="revert">Revert to Model-Driven</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="fail" id="fail" />
            <Label htmlFor="fail">Fail Execution</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="retry" id="retry" />
            <Label htmlFor="retry">Retry with Different Strategy</Label>
          </div>
        </RadioGroup>
      </FormField>
    </div>
  );
};
```

### 2. **StrandsWorkflowCanvas.tsx Enhancement**

#### **Current State Analysis:**
- ✅ Node rendering and interaction
- ✅ Edge connections
- ✅ Execution overlay
- ❌ No control mode visualization
- ❌ No user override indicators
- ❌ No quick edit functionality

#### **Required Changes:**

```typescript
// Enhanced node data interface
interface EnhancedStrandsWorkflowNode extends StrandsWorkflowNode {
  data: StrandsWorkflowNode['data'] & {
    // New: Control mode information
    controlMode: 'model-driven' | 'user-defined' | 'hybrid';
    hasUserOverrides: boolean;
    
    // New: Quick edit functionality
    onQuickEdit?: () => void;
    onControlModeToggle?: (mode: string) => void;
    
    // New: Execution mode indicator
    executionMode: 'ai-driven' | 'user-controlled' | 'hybrid-active';
  };
}

// Enhanced canvas component
const EnhancedStrandsWorkflowCanvas = ({ orchestrator, workflowId, ...props }) => {
  // Existing state + new state for control modes
  const [quickEditNode, setQuickEditNode] = useState<string | null>(null);
  const [controlModeFilter, setControlModeFilter] = useState<string | null>(null);

  // Enhanced node creation with control mode support
  const createEnhancedNode = useCallback((nodeData: any) => {
    return {
      ...nodeData,
      data: {
        ...nodeData.data,
        controlMode: nodeData.data.controlMode || 'model-driven',
        hasUserOverrides: !!nodeData.data.userOverrides,
        onQuickEdit: () => setQuickEditNode(nodeData.id),
        onControlModeToggle: (mode) => handleControlModeToggle(nodeData.id, mode),
        executionMode: determineExecutionMode(nodeData.data)
      }
    };
  }, []);

  return (
    <div className={`strands-workflow-canvas ${className}`}>
      {/* Enhanced toolbar with control mode filters */}
      <Panel position="top-left">
        <CanvasToolbar 
          onControlModeFilter={setControlModeFilter}
          activeFilter={controlModeFilter}
        />
      </Panel>

      <ReactFlow
        nodes={nodes.map(createEnhancedNode)}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        nodeTypes={enhancedNodeTypes}
        edgeTypes={edgeTypes}
        fitView
      >
        <Background />
        <Controls />
        <MiniMap 
          nodeColor={(node) => getNodeColorByControlMode(node.data.controlMode)}
        />
      </ReactFlow>

      {/* Quick Edit Dialog */}
      <QuickEditDialog 
        nodeId={quickEditNode}
        isOpen={!!quickEditNode}
        onClose={() => setQuickEditNode(null)}
        onSave={handleQuickEditSave}
      />

      {/* Existing execution overlay */}
      <StrandsExecutionOverlay 
        execution={currentExecution}
        isVisible={isExecuting}
      />
    </div>
  );
};
```

### 3. **StrandsWorkflowOrchestrator.ts Enhancement**

#### **Current State Analysis:**
- ✅ Basic workflow execution
- ✅ Node orchestration
- ✅ Context management
- ❌ No control mode handling
- ❌ No user override execution
- ❌ No hybrid execution logic

#### **Required Changes:**

```typescript
// Enhanced orchestrator class
export class HybridStrandsWorkflowOrchestrator extends StrandsWorkflowOrchestrator {
  
  // Enhanced node execution with control mode support
  async executeNode(node: EnhancedStrandsWorkflowNode, context: WorkflowContext): Promise<ExecutionResult> {
    const { controlMode, userOverrides, hybridConfig } = node.data;
    
    // Log execution mode for debugging
    console.log(`Executing node ${node.id} in ${controlMode} mode`);
    
    try {
      switch (controlMode) {
        case 'model-driven':
          return await this.executeModelDriven(node, context);
          
        case 'user-defined':
          return await this.executeUserDefined(node, context);
          
        case 'hybrid':
          return await this.executeHybrid(node, context);
          
        default:
          // Fallback to model-driven for backward compatibility
          return await this.executeModelDriven(node, context);
      }
    } catch (error) {
      // Enhanced error handling with fallback strategies
      return await this.handleExecutionError(node, context, error);
    }
  }

  // New: User-defined execution
  private async executeUserDefined(node: EnhancedStrandsWorkflowNode, context: WorkflowContext): Promise<ExecutionResult> {
    const { userOverrides } = node.data;
    
    if (!userOverrides?.explicitBehavior) {
      throw new Error('No user-defined behavior configured');
    }

    const { type, configuration } = userOverrides.explicitBehavior;
    
    switch (type) {
      case 'script':
        return await this.executeCustomScript(configuration, context);
        
      case 'api-call':
        return await this.executeAPICall(configuration, context);
        
      case 'data-transform':
        return await this.executeDataTransformation(configuration, context);
        
      case 'conditional-logic':
        return await this.executeConditionalLogic(configuration, context);
        
      default:
        throw new Error(`Unsupported behavior type: ${type}`);
    }
  }

  // New: Hybrid execution
  private async executeHybrid(node: EnhancedStrandsWorkflowNode, context: WorkflowContext): Promise<ExecutionResult> {
    const { hybridConfig, userOverrides } = node.data;
    
    if (!hybridConfig) {
      throw new Error('No hybrid configuration found');
    }

    const { controlStrategy, transitionTriggers } = hybridConfig;
    
    switch (controlStrategy) {
      case 'user-first':
        return await this.executeUserFirstStrategy(node, context);
        
      case 'model-first':
        return await this.executeModelFirstStrategy(node, context);
        
      case 'context-dependent':
        return await this.executeContextDependentStrategy(node, context);
        
      default:
        // Default to model-driven
        return await this.executeModelDriven(node, context);
    }
  }

  // New: User-first hybrid strategy
  private async executeUserFirstStrategy(node: EnhancedStrandsWorkflowNode, context: WorkflowContext): Promise<ExecutionResult> {
    try {
      // Try user-defined behavior first
      const userResult = await this.executeUserDefined(node, context);
      
      if (this.isSuccessfulResult(userResult)) {
        return userResult;
      }
    } catch (error) {
      console.log('User-defined execution failed, falling back to model-driven');
    }
    
    // Fallback to model-driven
    return await this.executeModelDriven(node, context);
  }

  // New: Model-first hybrid strategy
  private async executeModelFirstStrategy(node: EnhancedStrandsWorkflowNode, context: WorkflowContext): Promise<ExecutionResult> {
    // Execute model-driven behavior
    const modelResult = await this.executeModelDriven(node, context);
    
    // Apply user overrides as post-processing
    if (node.data.userOverrides?.conditionalOverrides) {
      return await this.applyConditionalOverrides(modelResult, node.data.userOverrides.conditionalOverrides, context);
    }
    
    return modelResult;
  }

  // New: Context-dependent strategy
  private async executeContextDependentStrategy(node: EnhancedStrandsWorkflowNode, context: WorkflowContext): Promise<ExecutionResult> {
    const { transitionTriggers } = node.data.hybridConfig;
    
    // Evaluate transition triggers to decide execution mode
    const shouldUseUserControl = await this.evaluateTransitionTriggers(transitionTriggers, context);
    
    if (shouldUseUserControl) {
      return await this.executeUserDefined(node, context);
    } else {
      return await this.executeModelDriven(node, context);
    }
  }

  // Enhanced error handling with fallback strategies
  private async handleExecutionError(node: EnhancedStrandsWorkflowNode, context: WorkflowContext, error: Error): Promise<ExecutionResult> {
    const fallbackStrategy = node.data.userOverrides?.fallbackStrategy || 'revert-to-model';
    
    switch (fallbackStrategy) {
      case 'revert-to-model':
        console.log('Reverting to model-driven execution due to error');
        return await this.executeModelDriven(node, context);
        
      case 'retry':
        console.log('Retrying execution with different strategy');
        // Implement retry logic
        return await this.retryWithDifferentStrategy(node, context);
        
      case 'fail':
      default:
        return {
          success: false,
          output: null,
          error: error.message,
          executionTime: 0,
          toolsUsed: [],
          metadata: { fallbackStrategy, originalError: error.message }
        };
    }
  }
}
```

### 4. **Node Component Enhancements**

#### **Enhanced Node Visualization:**

```typescript
// Enhanced base node component
const EnhancedStrandsAgentNode = ({ data, selected }) => {
  const { controlMode, hasUserOverrides, executionMode } = data;
  
  return (
    <div className={`strands-node ${selected ? 'selected' : ''}`}>
      {/* Existing node content */}
      <div className="node-content">
        {/* ... existing content ... */}
      </div>
      
      {/* New: Control mode indicator */}
      <div className="absolute top-1 right-1">
        <ControlModeIndicator mode={controlMode} />
      </div>
      
      {/* New: User override indicator */}
      {hasUserOverrides && (
        <div className="absolute top-1 left-1">
          <UserOverrideIndicator />
        </div>
      )}
      
      {/* New: Execution mode indicator */}
      <div className="absolute bottom-1 right-1">
        <ExecutionModeIndicator mode={executionMode} />
      </div>
      
      {/* New: Quick edit button */}
      <div className="absolute bottom-1 left-1">
        <Button 
          size="sm" 
          variant="ghost"
          onClick={data.onQuickEdit}
          className="opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <Settings className="w-3 h-3" />
        </Button>
      </div>
    </div>
  );
};
```

## 📋 Implementation Timeline

### Week 1-2: Core Interface Extensions
- [ ] Extend existing interfaces with control mode properties
- [ ] Add backward compatibility layer
- [ ] Create new UI components for control mode selection

### Week 3-4: Enhanced Configuration Dialog
- [ ] Add new tabs to StrandsAgentConfigDialog
- [ ] Implement user override configuration UI
- [ ] Add hybrid configuration section

### Week 5-6: Canvas and Orchestrator Updates
- [ ] Enhance StrandsWorkflowCanvas with control mode visualization
- [ ] Extend StrandsWorkflowOrchestrator with hybrid execution
- [ ] Add quick edit functionality

### Week 7-8: Node Component Enhancements
- [ ] Update all node components with control mode indicators
- [ ] Add execution mode visualization
- [ ] Implement quick edit dialogs

### Week 9-10: Integration and Testing
- [ ] Full system integration
- [ ] Backward compatibility testing
- [ ] Performance optimization
- [ ] User acceptance testing

## 🎯 Backward Compatibility Strategy

1. **Default Behavior**: All existing nodes default to 'model-driven' mode
2. **Migration Function**: Automatic migration of existing configurations
3. **Graceful Degradation**: System works even if new properties are missing
4. **Progressive Enhancement**: Users can opt-in to new features gradually

This approach ensures that existing workflows continue to work while providing powerful new capabilities for users who need explicit control over agent behavior.