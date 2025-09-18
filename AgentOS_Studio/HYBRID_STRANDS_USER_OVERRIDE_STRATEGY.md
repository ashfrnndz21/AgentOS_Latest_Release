# Hybrid Strands + User Override Strategy

## 🎯 Core Concept: Intelligent Defaults with User Control

The key insight is creating a **layered control system** where:
1. **Default Layer**: Strands model-driven intelligence
2. **Override Layer**: User-defined explicit behavior
3. **Hybrid Layer**: Combination of both approaches

## 🏗️ Architecture Changes to Existing System

### 1. **Enhanced Node Configuration Interface**

```typescript
interface HybridStrandsNode extends StrandsCompliantNode {
  // Control Mode Selection
  controlMode: 'model-driven' | 'user-defined' | 'hybrid';
  
  // User Override Configuration
  userOverrides: {
    // Explicit behavior definitions
    explicitBehavior?: ExplicitBehaviorConfig;
    
    // Conditional overrides
    conditionalOverrides?: ConditionalOverride[];
    
    // Fallback strategy when overrides fail
    fallbackStrategy: 'revert-to-model' | 'fail' | 'retry' | 'custom';
  };
  
  // Hybrid Configuration
  hybridConfig?: {
    // When to use model vs user control
    controlStrategy: 'user-first' | 'model-first' | 'context-dependent';
    
    // Transition conditions
    transitionTriggers: TransitionTrigger[];
    
    // Override boundaries
    overrideBoundaries: OverrideBoundary[];
  };
}

interface ExplicitBehaviorConfig {
  // Direct action definitions
  actions: ExplicitAction[];
  
  // Input/Output specifications
  inputSchema: JSONSchema;
  outputSchema: JSONSchema;
  
  // Processing logic
  processingLogic: ProcessingLogic;
  
  // Error handling
  errorHandling: ExplicitErrorHandling;
}
```

### 2. **Modifications to Existing Components**

#### **A. StrandsAgentConfigDialog.tsx Enhancement**

```typescript
// Current: Basic agent configuration
// New: Hybrid control configuration

const EnhancedStrandsAgentConfigDialog = ({ node, onSave }) => {
  const [controlMode, setControlMode] = useState(node.controlMode || 'model-driven');
  
  return (
    <Dialog>
      <DialogContent className="max-w-4xl">
        {/* Control Mode Selection */}
        <ControlModeSelector 
          value={controlMode}
          onChange={setControlMode}
          options={[
            {
              value: 'model-driven',
              label: 'Model-Driven (Strands Default)',
              description: 'Agent uses AI reasoning to decide actions',
              icon: Brain
            },
            {
              value: 'user-defined',
              label: 'User-Defined Behavior',
              description: 'Explicit rules and actions defined by user',
              icon: Settings
            },
            {
              value: 'hybrid',
              label: 'Hybrid Approach',
              description: 'Combine AI intelligence with user control',
              icon: Zap
            }
          ]}
        />
        
        {/* Dynamic Configuration Sections */}
        {controlMode === 'model-driven' && (
          <StrandsModelDrivenSection node={node} />
        )}
        
        {controlMode === 'user-defined' && (
          <UserDefinedBehaviorSection node={node} />
        )}
        
        {controlMode === 'hybrid' && (
          <>
            <StrandsModelDrivenSection node={node} />
            <UserOverrideSection node={node} />
            <HybridControlSection node={node} />
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};
```

#### **B. Node Execution Engine Changes**

```typescript
// Current: StrandsWorkflowOrchestrator.ts
// New: HybridExecutionOrchestrator.ts

class HybridExecutionOrchestrator extends StrandsWorkflowOrchestrator {
  async executeNode(node: HybridStrandsNode, context: ExecutionContext): Promise<ExecutionResult> {
    switch (node.controlMode) {
      case 'model-driven':
        return await this.executeModelDriven(node, context);
        
      case 'user-defined':
        return await this.executeUserDefined(node, context);
        
      case 'hybrid':
        return await this.executeHybrid(node, context);
    }
  }
  
  private async executeHybrid(node: HybridStrandsNode, context: ExecutionContext): Promise<ExecutionResult> {
    const { controlStrategy } = node.hybridConfig;
    
    switch (controlStrategy) {
      case 'user-first':
        // Try user-defined behavior first, fallback to model
        try {
          const userResult = await this.executeUserDefined(node, context);
          if (this.isSuccessful(userResult)) return userResult;
        } catch (error) {
          // Fallback to model-driven
          return await this.executeModelDriven(node, context);
        }
        
      case 'model-first':
        // Use model intelligence, apply user overrides as constraints
        const modelResult = await this.executeModelDriven(node, context);
        return await this.applyUserOverrides(modelResult, node.userOverrides);
        
      case 'context-dependent':
        // Decide based on context and transition triggers
        const shouldUseUserControl = await this.evaluateTransitionTriggers(
          node.hybridConfig.transitionTriggers, 
          context
        );
        
        return shouldUseUserControl 
          ? await this.executeUserDefined(node, context)
          : await this.executeModelDriven(node, context);
    }
  }
}
```

### 3. **User-Defined Behavior Configuration UI**

```typescript
const UserDefinedBehaviorSection = ({ node, onChange }) => {
  return (
    <ConfigSection title="User-Defined Behavior" icon={Settings}>
      {/* Behavior Type Selection */}
      <FormField label="Behavior Type">
        <Select 
          value={node.userOverrides?.explicitBehavior?.type}
          options={[
            { value: 'script', label: 'Custom Script', description: 'JavaScript/Python code execution' },
            { value: 'api-call', label: 'API Call', description: 'Direct API endpoint invocation' },
            { value: 'data-transform', label: 'Data Transformation', description: 'Structured data processing' },
            { value: 'conditional-logic', label: 'Conditional Logic', description: 'If-then-else rules' },
            { value: 'workflow-step', label: 'Workflow Step', description: 'Predefined workflow action' }
          ]}
        />
      </FormField>
      
      {/* Dynamic Configuration Based on Type */}
      <DynamicBehaviorConfig 
        behaviorType={node.userOverrides?.explicitBehavior?.type}
        config={node.userOverrides?.explicitBehavior}
        onChange={onChange}
      />
      
      {/* Input/Output Schema Definition */}
      <SchemaDefinitionSection 
        inputSchema={node.userOverrides?.explicitBehavior?.inputSchema}
        outputSchema={node.userOverrides?.explicitBehavior?.outputSchema}
        onChange={onChange}
      />
      
      {/* Error Handling Configuration */}
      <ErrorHandlingSection 
        config={node.userOverrides?.explicitBehavior?.errorHandling}
        onChange={onChange}
      />
    </ConfigSection>
  );
};
```

### 4. **Hybrid Control Configuration**

```typescript
const HybridControlSection = ({ node, onChange }) => {
  return (
    <ConfigSection title="Hybrid Control Strategy" icon={Zap}>
      {/* Control Strategy */}
      <FormField label="Control Strategy">
        <RadioGroup 
          value={node.hybridConfig?.controlStrategy}
          options={[
            {
              value: 'user-first',
              label: 'User First',
              description: 'Try user-defined behavior, fallback to AI'
            },
            {
              value: 'model-first',
              label: 'Model First',
              description: 'Use AI intelligence with user constraints'
            },
            {
              value: 'context-dependent',
              label: 'Context Dependent',
              description: 'Switch based on conditions'
            }
          ]}
        />
      </FormField>
      
      {/* Transition Triggers */}
      <TransitionTriggersConfig 
        triggers={node.hybridConfig?.transitionTriggers}
        onChange={onChange}
      />
      
      {/* Override Boundaries */}
      <OverrideBoundariesConfig 
        boundaries={node.hybridConfig?.overrideBoundaries}
        onChange={onChange}
      />
    </ConfigSection>
  );
};
```

## 🔄 Impact on Existing Architecture

### 1. **Backward Compatibility**

```typescript
// Migration strategy for existing nodes
class NodeMigrationService {
  static migrateToHybrid(existingNode: any): HybridStrandsNode {
    return {
      ...existingNode,
      controlMode: 'model-driven', // Default to existing behavior
      userOverrides: {
        fallbackStrategy: 'revert-to-model'
      },
      // Preserve all existing configuration
      strandsConfig: existingNode.strandsConfig || getDefaultStrandsConfig()
    };
  }
}
```

### 2. **Enhanced Existing Components**

#### **A. StrandsAgentPalette.tsx Changes**

```typescript
// Current: Basic agent selection
// New: Control mode indication

const EnhancedStrandsAgentPalette = ({ onAddAgent }) => {
  return (
    <div className="agent-palette">
      {agents.map(agent => (
        <AgentCard 
          key={agent.id}
          agent={agent}
          onAdd={onAddAgent}
          // New: Show control mode indicator
          controlModeIndicator={
            <ControlModeIndicator mode={agent.controlMode} />
          }
          // New: Quick control mode toggle
          onControlModeChange={(mode) => updateAgentControlMode(agent.id, mode)}
        />
      ))}
    </div>
  );
};
```

#### **B. StrandsWorkflowCanvas.tsx Enhancements**

```typescript
// Current: Basic node rendering
// New: Visual indicators for control modes

const EnhancedStrandsWorkflowCanvas = ({ nodes, edges }) => {
  return (
    <ReactFlow
      nodes={nodes.map(node => ({
        ...node,
        data: {
          ...node.data,
          // New: Visual control mode indicator
          controlMode: node.controlMode,
          // New: Quick edit access
          onQuickEdit: () => openQuickEditDialog(node),
          // New: Override status
          hasUserOverrides: !!node.userOverrides?.explicitBehavior
        }
      }))}
      nodeTypes={{
        ...existingNodeTypes,
        // Enhanced node types with control mode support
        strandsAgent: EnhancedStrandsAgentNode,
        strandsTask: EnhancedStrandsTaskNode,
        // ... other enhanced node types
      }}
    />
  );
};
```

### 3. **New UI Components Needed**

```typescript
// Control Mode Indicator
const ControlModeIndicator = ({ mode }) => {
  const config = {
    'model-driven': { icon: Brain, color: 'blue', label: 'AI' },
    'user-defined': { icon: Settings, color: 'green', label: 'Manual' },
    'hybrid': { icon: Zap, color: 'purple', label: 'Hybrid' }
  };
  
  const { icon: Icon, color, label } = config[mode];
  
  return (
    <Badge variant="outline" className={`border-${color}-500 text-${color}-700`}>
      <Icon className="w-3 h-3 mr-1" />
      {label}
    </Badge>
  );
};

// Quick Edit Dialog
const QuickEditDialog = ({ node, isOpen, onClose }) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Quick Edit: {node.data.label}</DialogTitle>
        </DialogHeader>
        
        {/* Quick control mode switch */}
        <ControlModeToggle 
          value={node.controlMode}
          onChange={(mode) => updateNodeControlMode(node.id, mode)}
        />
        
        {/* Context-sensitive quick settings */}
        <QuickSettingsPanel node={node} />
      </DialogContent>
    </Dialog>
  );
};
```

## 🎨 User Experience Enhancements

### 1. **Progressive Disclosure**

```typescript
// Start simple, add complexity as needed
const ProgressiveConfigurationWizard = ({ node }) => {
  const [complexity, setComplexity] = useState('simple');
  
  return (
    <div>
      {/* Complexity Level Selector */}
      <ComplexitySelector 
        value={complexity}
        onChange={setComplexity}
        levels={[
          { value: 'simple', label: 'Simple', description: 'Basic AI behavior' },
          { value: 'advanced', label: 'Advanced', description: 'Custom overrides' },
          { value: 'expert', label: 'Expert', description: 'Full hybrid control' }
        ]}
      />
      
      {/* Dynamic Configuration UI */}
      {complexity === 'simple' && <SimpleConfigPanel node={node} />}
      {complexity === 'advanced' && <AdvancedConfigPanel node={node} />}
      {complexity === 'expert' && <ExpertConfigPanel node={node} />}
    </div>
  );
};
```

### 2. **Visual Workflow Indicators**

```typescript
// Enhanced node visualization
const EnhancedNodeVisualization = ({ node }) => {
  return (
    <div className="relative">
      {/* Base node */}
      <BaseNodeComponent node={node} />
      
      {/* Control mode indicator */}
      <div className="absolute top-1 right-1">
        <ControlModeIndicator mode={node.controlMode} />
      </div>
      
      {/* Override indicator */}
      {node.userOverrides?.explicitBehavior && (
        <div className="absolute bottom-1 right-1">
          <OverrideIndicator overrides={node.userOverrides} />
        </div>
      )}
      
      {/* Execution status */}
      <ExecutionStatusIndicator 
        status={node.executionStatus}
        mode={node.controlMode}
      />
    </div>
  );
};
```

## 📋 Implementation Phases

### Phase 1: Core Hybrid Architecture (Week 1-2)
1. Extend existing node interfaces with hybrid configuration
2. Update `StrandsWorkflowOrchestrator` to `HybridExecutionOrchestrator`
3. Add backward compatibility migration
4. Basic control mode selection UI

### Phase 2: User-Defined Behavior System (Week 3-4)
1. Implement explicit behavior configuration
2. Add user-defined execution engine
3. Create behavior type-specific UI components
4. Add input/output schema definition

### Phase 3: Hybrid Control Logic (Week 5-6)
1. Implement hybrid execution strategies
2. Add transition triggers and boundaries
3. Create hybrid configuration UI
4. Add fallback and error handling

### Phase 4: Enhanced UI/UX (Week 7-8)
1. Update existing components with control mode indicators
2. Add quick edit functionality
3. Implement progressive disclosure
4. Add visual workflow indicators

### Phase 5: Integration & Testing (Week 9-10)
1. Full integration with existing system
2. Migration of existing workflows
3. Comprehensive testing
4. Performance optimization

## 🎯 Benefits of This Approach

### 1. **Preserves Existing Investment**
- All current workflows continue to work
- Gradual migration path
- No breaking changes

### 2. **Flexible Control Spectrum**
- Pure AI intelligence (Strands default)
- Pure user control (traditional approach)
- Hybrid combinations (best of both)

### 3. **Progressive Complexity**
- Start simple with AI defaults
- Add overrides as needed
- Full expert control when required

### 4. **Maintains Strands Philosophy**
- Model-driven remains the default
- User overrides are contextual enhancements
- AI intelligence is preserved and enhanced

This hybrid approach allows users to have the best of both worlds: intelligent AI behavior by default, with the ability to override and control specific aspects when needed, all while maintaining the existing system's functionality.