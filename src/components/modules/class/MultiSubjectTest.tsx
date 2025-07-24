/**
 * Multi-Subject Test Component
 * Test the new multi-subject APIs and functionality
 */

import React, { useState, useEffect } from 'react';
import { Card, CardBody, CardHeader, Button, Select, SelectItem } from '@heroui/react';
import { classService } from '../../../services/classService';
import { subjectService } from '../../../services/subjectService';
import { Class, Subject } from '../../../services/types';

const MultiSubjectTest: React.FC = () => {
  const [classes, setClasses] = useState<Class[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [selectedClass, setSelectedClass] = useState<string>('');
  const [selectedSubject, setSelectedSubject] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<string>('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setIsLoading(true);
      
      // Load classes
      const classResponse = await classService.getClasses();
      if (classResponse.success && classResponse.data) {
        setClasses(classResponse.data);
        console.log('📋 Classes loaded:', classResponse.data);
      }

      // Load subjects
      const subjectResponse = await subjectService.getSubjects();
      if (subjectResponse.success && subjectResponse.data) {
        setSubjects(subjectResponse.data);
        console.log('📚 Subjects loaded:', subjectResponse.data);
      }

    } catch (error) {
      console.error('❌ Error loading data:', error);
      setResult('Error loading data: ' + error);
    } finally {
      setIsLoading(false);
    }
  };

  const testAddSubjectToClass = async () => {
    if (!selectedClass || !selectedSubject) {
      setResult('❌ Please select both class and subject');
      return;
    }

    try {
      setIsLoading(true);
      setResult('🔄 Adding subject to class...');

      const response = await classService.addSubjectToClass({
        classId: selectedClass,
        subjectId: selectedSubject
      });

      if (response.success) {
        setResult('✅ Subject successfully added to class!\n' + JSON.stringify(response.data, null, 2));
        console.log('✅ Add subject success:', response);
      } else {
        setResult('❌ Failed to add subject: ' + response.error);
        console.error('❌ Add subject failed:', response.error);
      }

    } catch (error) {
      setResult('❌ Error: ' + error);
      console.error('❌ Add subject error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const testGetClassSubjects = async () => {
    if (!selectedClass) {
      setResult('❌ Please select a class');
      return;
    }

    try {
      setIsLoading(true);
      setResult('🔄 Getting class subjects...');

      const response = await classService.getClassSubjects(selectedClass);

      if (response.success) {
        setResult('✅ Class subjects retrieved!\n' + JSON.stringify(response.data, null, 2));
        console.log('✅ Get class subjects success:', response);
      } else {
        setResult('❌ Failed to get class subjects: ' + response.error);
        console.error('❌ Get class subjects failed:', response.error);
      }

    } catch (error) {
      setResult('❌ Error: ' + error);
      console.error('❌ Get class subjects error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <h2 className="text-2xl font-bold">🧪 Multi-Subject API Test</h2>
      </CardHeader>
      <CardBody className="space-y-4">
        
        {/* Data Display */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold">📋 Classes ({classes.length})</h3>
            </CardHeader>
            <CardBody>
              <div className="space-y-2 max-h-32 overflow-y-auto">
                {classes.map(cls => (
                  <div key={cls.id} className="text-sm">
                    <strong>{cls.name}</strong>
                    {cls.classSubjects && cls.classSubjects.length > 0 && (
                      <div className="ml-2 text-gray-600">
                        Subjects: {cls.classSubjects.map(cs => cs.subject?.name).join(', ')}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardBody>
          </Card>

          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold">📚 Subjects ({subjects.length})</h3>
            </CardHeader>
            <CardBody>
              <div className="space-y-2 max-h-32 overflow-y-auto">
                {subjects.map(subject => (
                  <div key={subject.id} className="text-sm">
                    <strong>{subject.name}</strong> ({subject.code})
                  </div>
                ))}
              </div>
            </CardBody>
          </Card>
        </div>

        {/* Test Controls */}
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Select
              label="Select Class"
              placeholder="Choose a class"
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
            >
              {classes.map(cls => (
                <SelectItem key={cls.id} value={cls.id}>
                  {cls.name}
                </SelectItem>
              ))}
            </Select>

            <Select
              label="Select Subject"
              placeholder="Choose a subject"
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
            >
              {subjects.map(subject => (
                <SelectItem key={subject.id} value={subject.id}>
                  {subject.name}
                </SelectItem>
              ))}
            </Select>
          </div>

          <div className="flex gap-2 flex-wrap">
            <Button
              color="primary"
              onClick={testAddSubjectToClass}
              isLoading={isLoading}
              isDisabled={!selectedClass || !selectedSubject}
            >
              🎯 Add Subject to Class
            </Button>

            <Button
              color="secondary"
              onClick={testGetClassSubjects}
              isLoading={isLoading}
              isDisabled={!selectedClass}
            >
              📋 Get Class Subjects
            </Button>

            <Button
              color="default"
              onClick={loadData}
              isLoading={isLoading}
            >
              🔄 Reload Data
            </Button>
          </div>
        </div>

        {/* Result Display */}
        {result && (
          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold">📊 Test Result</h3>
            </CardHeader>
            <CardBody>
              <pre className="text-sm whitespace-pre-wrap bg-gray-100 p-3 rounded overflow-x-auto">
                {result}
              </pre>
            </CardBody>
          </Card>
        )}

      </CardBody>
    </Card>
  );
};

export default MultiSubjectTest;
