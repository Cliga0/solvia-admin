"use client";

import { useState } from "react";
import { SystemSetting } from "@/types/system-settings";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Check, X, RotateCcw } from "lucide-react";

interface SettingFieldProps {
  setting: SystemSetting;
  onSave: (key: string, value: string) => Promise<void>;
  disabled?: boolean;
}

export function SettingField({
  setting,
  onSave,
  disabled,
}: SettingFieldProps) {
  const [editValue, setEditValue] = useState(setting.value);
  const [isSaving, setIsSaving] = useState(false);

  const hasChanged = editValue !== setting.value;

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await onSave(setting.key, editValue);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setEditValue(setting.value);
  };

  const handleReset = () => {
    setEditValue(setting.value);
  };

  const renderInput = () => {
    if (setting.valueType === "BOOLEAN") {
      return (
        <div className="flex items-center gap-3">
          <Switch
            checked={editValue === "true"}
            onCheckedChange={(checked) => {
              const newValue = checked ? "true" : "false";
              setEditValue(newValue);
            }}
            disabled={disabled || !setting.isEditable}
          />
          <span className="text-sm text-muted-foreground">
            {editValue === "true" ? "Enabled" : "Disabled"}
          </span>
          {hasChanged && (
            <div className="flex items-center gap-1 ml-2">
              <Button
                size="icon-xs"
                variant="default"
                onClick={handleSave}
                disabled={isSaving}
              >
                <Check className="size-3" />
              </Button>
              <Button
                size="icon-xs"
                variant="ghost"
                onClick={handleCancel}
                disabled={isSaving}
              >
                <X className="size-3" />
              </Button>
            </div>
          )}
        </div>
      );
    }

    if (setting.valueType === "JSON") {
      return (
        <Textarea
          value={editValue}
          onChange={(e) => {
            setEditValue(e.target.value);
          }}
          disabled={disabled || !setting.isEditable}
          rows={4}
          className="font-mono text-sm"
        />
      );
    }

    if (setting.valueType === "NUMBER") {
      return (
        <Input
          type="number"
          value={editValue}
          onChange={(e) => {
            setEditValue(e.target.value);
          }}
          disabled={disabled || !setting.isEditable}
          className="max-w-[200px]"
        />
      );
    }

    return (
      <Input
        type="text"
        value={editValue}
        onChange={(e) => {
          setEditValue(e.target.value);
        }}
        disabled={disabled || !setting.isEditable}
      />
    );
  };

  return (
    <div className="flex flex-col gap-2 py-4 border-b last:border-b-0">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Label className="text-sm font-medium">{setting.key}</Label>
          {setting.isPublic && (
            <Badge variant="secondary" className="text-xs">
              Public
            </Badge>
          )}
          {!setting.isEditable && (
            <Badge variant="outline" className="text-xs">
              Read-only
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-1">
          {setting.valueType !== "BOOLEAN" && hasChanged && (
            <>
              <Button
                size="icon-xs"
                variant="ghost"
                onClick={handleReset}
                disabled={isSaving}
                title="Reset"
              >
                <RotateCcw className="size-3" />
              </Button>
              <Button
                size="xs"
                variant="ghost"
                onClick={handleCancel}
                disabled={isSaving}
              >
                Cancel
              </Button>
              <Button
                size="xs"
                variant="default"
                onClick={handleSave}
                disabled={isSaving}
              >
                <Check className="size-3" />
                Save
              </Button>
            </>
          )}
        </div>
      </div>
      {setting.description && (
        <p className="text-xs text-muted-foreground">{setting.description}</p>
      )}
      {renderInput()}
    </div>
  );
}
