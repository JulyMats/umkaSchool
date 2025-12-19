package com.app.umkaSchool.service.impl;

import com.app.umkaSchool.dto.exercise.CreateExerciseRequest;
import com.app.umkaSchool.dto.exercise.ExerciseResponse;
import com.app.umkaSchool.dto.exercise.GenerateExerciseNumbersRequest;
import com.app.umkaSchool.dto.exercise.GenerateExerciseNumbersResponse;
import com.app.umkaSchool.dto.exercise.UpdateExerciseRequest;
import com.app.umkaSchool.dto.exercise.ValidateAnswerRequest;
import com.app.umkaSchool.dto.exercise.ValidateAnswerResponse;
import com.app.umkaSchool.exception.ResourceNotFoundException;
import com.app.umkaSchool.model.Exercise;
import com.app.umkaSchool.model.ExerciseType;
import com.app.umkaSchool.model.Teacher;
import com.app.umkaSchool.repository.ExerciseRepository;
import com.app.umkaSchool.repository.ExerciseTypeRepository;
import com.app.umkaSchool.repository.TeacherRepository;
import com.app.umkaSchool.service.ExerciseService;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.ArrayList;
import java.util.List;
import java.util.Random;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class ExerciseServiceImpl implements ExerciseService {
    private static final Logger logger = LoggerFactory.getLogger(ExerciseServiceImpl.class);

    private final ExerciseRepository exerciseRepository;
    private final ExerciseTypeRepository exerciseTypeRepository;
    private final TeacherRepository teacherRepository;
    private final ObjectMapper objectMapper;
    private final Random random;

    @Autowired
    public ExerciseServiceImpl(ExerciseRepository exerciseRepository,
                               ExerciseTypeRepository exerciseTypeRepository,
                               TeacherRepository teacherRepository) {
        this.exerciseRepository = exerciseRepository;
        this.exerciseTypeRepository = exerciseTypeRepository;
        this.teacherRepository = teacherRepository;
        this.objectMapper = new ObjectMapper();
        this.random = new Random();
    }

    @Override
    @Transactional
    public ExerciseResponse createExercise(CreateExerciseRequest request) {
        logger.info("Creating new exercise for type: {}", request.getExerciseTypeId());

        ExerciseType exerciseType = exerciseTypeRepository.findById(request.getExerciseTypeId())
                .orElseThrow(() -> new ResourceNotFoundException("Exercise type not found"));

        Exercise exercise = new Exercise();
        exercise.setExerciseType(exerciseType);
        exercise.setParameters(request.getParameters());
        
        // Calculate difficulty if not provided
        if (request.getDifficulty() != null) {
            exercise.setDifficulty(request.getDifficulty());
        } else {
            Integer calculatedDifficulty = calculateDifficulty(request.getExerciseTypeId(), request.getParameters());
            exercise.setDifficulty(calculatedDifficulty);
        }
        
        // Calculate points if not provided
        if (request.getPoints() != null) {
            exercise.setPoints(request.getPoints());
        } else {
            exercise.setPoints(exercise.getDifficulty() * 10);
        }

        if (request.getCreatedById() != null) {
            Teacher teacher = teacherRepository.findById(request.getCreatedById())
                    .orElseThrow(() -> new ResourceNotFoundException("Teacher not found"));
            exercise.setCreatedBy(teacher);
        }

        exercise = exerciseRepository.save(exercise);
        logger.info("Exercise created successfully: {} with difficulty: {} and points: {}", 
                exercise.getId(), exercise.getDifficulty(), exercise.getPoints());

        return mapToResponse(exercise);
    }

    @Override
    @Transactional
    public ExerciseResponse updateExercise(UUID exerciseId, UpdateExerciseRequest request) {
        logger.info("Updating exercise: {}", exerciseId);

        Exercise exercise = exerciseRepository.findById(exerciseId)
                .orElseThrow(() -> new ResourceNotFoundException("Exercise not found"));

        if (request.getExerciseTypeId() != null) {
            ExerciseType exerciseType = exerciseTypeRepository.findById(request.getExerciseTypeId())
                    .orElseThrow(() -> new ResourceNotFoundException("Exercise type not found"));
            exercise.setExerciseType(exerciseType);
        }

        if (request.getParameters() != null) {
            exercise.setParameters(request.getParameters());
        }
        if (request.getDifficulty() != null) {
            exercise.setDifficulty(request.getDifficulty());
        }
        if (request.getPoints() != null) {
            exercise.setPoints(request.getPoints());
        }
        if (request.getCreatedById() != null) {
            Teacher teacher = teacherRepository.findById(request.getCreatedById())
                    .orElseThrow(() -> new ResourceNotFoundException("Teacher not found"));
            exercise.setCreatedBy(teacher);
        }

        exercise = exerciseRepository.save(exercise);
        logger.info("Exercise updated successfully: {}", exerciseId);

        return mapToResponse(exercise);
    }

    @Override
    public ExerciseResponse getExerciseById(UUID exerciseId) {
        Exercise exercise = exerciseRepository.findById(exerciseId)
                .orElseThrow(() -> new ResourceNotFoundException("Exercise not found"));
        return mapToResponse(exercise);
    }

    @Override
    public List<ExerciseResponse> getAllExercises() {
        return exerciseRepository.findAllByOrderByCreatedAtDesc().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    public List<ExerciseResponse> getExercisesByType(UUID exerciseTypeId) {
        return exerciseRepository.findByExerciseType_IdOrderByDifficultyAsc(exerciseTypeId).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    public List<ExerciseResponse> getExercisesByTeacher(UUID teacherId) {
        return exerciseRepository.findByCreatedBy_IdOrderByCreatedAtDesc(teacherId).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    public List<ExerciseResponse> getExercisesByDifficulty(Integer difficulty) {
        return exerciseRepository.findByDifficultyOrderByCreatedAtDesc(difficulty).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public void deleteExercise(UUID exerciseId) {
        logger.info("Deleting exercise: {}", exerciseId);

        Exercise exercise = exerciseRepository.findById(exerciseId)
                .orElseThrow(() -> new ResourceNotFoundException("Exercise not found"));

        exerciseRepository.delete(exercise);
        logger.info("Exercise deleted successfully: {}", exerciseId);
    }

    @Override
    public Exercise getExerciseEntity(UUID exerciseId) {
        return exerciseRepository.findById(exerciseId)
                .orElseThrow(() -> new IllegalArgumentException("Exercise not found"));
    }

    @Override
    public GenerateExerciseNumbersResponse generateExerciseNumbers(GenerateExerciseNumbersRequest request) {
        logger.info("Generating exercise numbers for exercise: {}", request.getExerciseId());
        
        Exercise exercise = exerciseRepository.findById(request.getExerciseId())
                .orElseThrow(() -> new ResourceNotFoundException("Exercise not found"));
        
        ExerciseType exerciseType = exercise.getExerciseType();
        String exerciseTypeName = exerciseType.getName().toLowerCase();
        
        // Parse parameters to get constraints
        Integer cardCount = request.getCardCount() != null ? request.getCardCount() : 5;
        Integer digitLength = request.getDigitLength() != null ? request.getDigitLength() : 1;
        Integer min = request.getMin();
        Integer max = request.getMax();
        
        // Generate numbers
        List<Integer> numbers = generateNumbers(cardCount, digitLength, min, max);
        
        // Calculate expected answer based on exercise type
        Double expectedAnswer = calculateExpectedAnswer(numbers, exerciseTypeName);
        
        logger.info("Generated {} numbers for exercise type: {}, expected answer: {}", 
                numbers.size(), exerciseTypeName, expectedAnswer);
        
        return GenerateExerciseNumbersResponse.builder()
                .numbers(numbers)
                .expectedAnswer(expectedAnswer)
                .exerciseTypeName(exerciseType.getName())
                .build();
    }

    @Override
    public ValidateAnswerResponse validateAnswer(ValidateAnswerRequest request) {
        logger.info("Validating answer for exercise: {}", request.getExerciseId());
        
        Exercise exercise = exerciseRepository.findById(request.getExerciseId())
                .orElseThrow(() -> new ResourceNotFoundException("Exercise not found"));
        
        ExerciseType exerciseType = exercise.getExerciseType();
        String exerciseTypeName = exerciseType.getName().toLowerCase();
        
        // Calculate expected answer
        Double expectedAnswer = calculateExpectedAnswer(request.getNumbers(), exerciseTypeName);
        
        // Validate with tolerance for floating point precision
        double tolerance = 0.0001;
        boolean isCorrect = Math.abs(request.getStudentAnswer() - expectedAnswer) < tolerance;
        double difference = Math.abs(request.getStudentAnswer() - expectedAnswer);
        
        logger.info("Answer validation - Expected: {}, Student: {}, Correct: {}", 
                expectedAnswer, request.getStudentAnswer(), isCorrect);
        
        return ValidateAnswerResponse.builder()
                .isCorrect(isCorrect)
                .expectedAnswer(expectedAnswer)
                .studentAnswer(request.getStudentAnswer())
                .difference(difference)
                .build();
    }

    @Override
    @Transactional
    public Exercise cloneExercise(UUID exerciseId) {
        logger.info("Cloning exercise: {}", exerciseId);
        
        Exercise originalExercise = exerciseRepository.findById(exerciseId)
                .orElseThrow(() -> new ResourceNotFoundException("Exercise not found"));
        
        Exercise clonedExercise = new Exercise();
        clonedExercise.setExerciseType(originalExercise.getExerciseType());
        clonedExercise.setParameters(originalExercise.getParameters());
        clonedExercise.setDifficulty(originalExercise.getDifficulty());
        clonedExercise.setPoints(originalExercise.getPoints());
        
        clonedExercise = exerciseRepository.save(clonedExercise);
        logger.info("Exercise cloned successfully. Original: {}, Clone: {}", 
                exerciseId, clonedExercise.getId());
        
        return clonedExercise;
    }

    @Override
    public Integer calculateDifficulty(UUID exerciseTypeId, String parametersJson) {
        ExerciseType exerciseType = exerciseTypeRepository.findById(exerciseTypeId)
                .orElseThrow(() -> new ResourceNotFoundException("Exercise type not found"));
        
        try {
            JsonNode params = objectMapper.readTree(parametersJson);
            String exerciseTypeName = exerciseType.getName().toLowerCase();
            
            // Base difficulty from exercise type
            int baseDifficulty = exerciseType.getBaseDifficulty();
            int difficulty = baseDifficulty;
            
            // Adjust based on exercise type and parameters
            if (exerciseTypeName.contains("division") || exerciseTypeName.contains("multiplication")) {
                // For division/multiplication, consider digit ranges
                if (params.has("dividendDigits") && params.get("dividendDigits").isArray()) {
                    int avgDividendDigits = (params.get("dividendDigits").get(0).asInt() + 
                                           params.get("dividendDigits").get(1).asInt()) / 2;
                    int avgDivisorDigits = params.has("divisorDigits") && params.get("divisorDigits").isArray() ?
                            (params.get("divisorDigits").get(0).asInt() + 
                             params.get("divisorDigits").get(1).asInt()) / 2 : 1;
                    difficulty = Math.min(10, Math.max(1, baseDifficulty + (avgDividendDigits + avgDivisorDigits) / 2));
                } else if (params.has("firstMultiplierDigits") && params.get("firstMultiplierDigits").isArray()) {
                    int avgMultiplierDigits = (params.get("firstMultiplierDigits").get(0).asInt() + 
                                              params.get("firstMultiplierDigits").get(1).asInt()) / 2;
                    difficulty = Math.min(10, Math.max(1, baseDifficulty + avgMultiplierDigits));
                }
            } else if (exerciseTypeName.contains("addition") || exerciseTypeName.contains("subtraction") || 
                      exerciseTypeName.contains("theme")) {
                // For addition/subtraction, consider digit length and card count
                int digitLength = params.has("digitLength") ? params.get("digitLength").asInt() : 1;
                int cardCount = params.has("cardCount") ? params.get("cardCount").asInt() : 5;
                difficulty = Math.min(10, Math.max(1, baseDifficulty + digitLength + (cardCount / 3)));
            }
            
            return Math.min(10, Math.max(1, difficulty));
        } catch (Exception e) {
            logger.warn("Error calculating difficulty, using base difficulty: {}", e.getMessage());
            return exerciseType.getBaseDifficulty();
        }
    }

    private List<Integer> generateNumbers(int count, int digitLength, Integer min, Integer max) {
        List<Integer> numbers = new ArrayList<>();
        int calculatedMin;
        int calculatedMax;
        
        if (min != null && max != null) {
            calculatedMin = min;
            calculatedMax = max;
        } else {
            // Default calculation based on digitLength
            calculatedMin = digitLength == 1 ? 1 : (int) Math.pow(10, digitLength - 1);
            calculatedMax = (int) Math.pow(10, digitLength) - 1;
        }
        
        for (int i = 0; i < count; i++) {
            int number = random.nextInt(calculatedMax - calculatedMin + 1) + calculatedMin;
            numbers.add(number);
        }
        
        return numbers;
    }

    private Double calculateExpectedAnswer(List<Integer> numbers, String exerciseTypeName) {
        if (numbers == null || numbers.isEmpty()) {
            return 0.0;
        }
        
        if (exerciseTypeName.contains("addition") || exerciseTypeName.contains("add")) {
            // Addition: sum all numbers
            return numbers.stream().mapToInt(Integer::intValue).sum() * 1.0;
        } else if (exerciseTypeName.contains("subtraction") || exerciseTypeName.contains("subtract")) {
            // Subtraction: subtract all numbers from the first
            if (numbers.size() == 1) {
                return numbers.get(0) * 1.0;
            }
            int result = numbers.get(0);
            for (int i = 1; i < numbers.size(); i++) {
                result -= numbers.get(i);
            }
            return result * 1.0;
        } else if (exerciseTypeName.contains("multiplication") || exerciseTypeName.contains("multiply")) {
            // Multiplication: multiply all numbers
            int product = 1;
            for (Integer number : numbers) {
                product *= number;
            }
            return product * 1.0;
        } else if (exerciseTypeName.contains("division") || exerciseTypeName.contains("divide")) {
            // Division: divide first number by all others
            if (numbers.size() == 1) {
                return numbers.get(0) * 1.0;
            }
            double result = numbers.get(0) * 1.0;
            for (int i = 1; i < numbers.size(); i++) {
                if (numbers.get(i) != 0) {
                    result /= numbers.get(i);
                } else {
                    throw new IllegalArgumentException("Division by zero");
                }
            }
            // Round to 2 decimal places
            return BigDecimal.valueOf(result).setScale(2, RoundingMode.HALF_UP).doubleValue();
        } else {
            // Default to addition
            return numbers.stream().mapToInt(Integer::intValue).sum() * 1.0;
        }
    }

    private ExerciseResponse mapToResponse(Exercise exercise) {
        return ExerciseResponse.builder()
                .id(exercise.getId())
                .exerciseTypeId(exercise.getExerciseType().getId())
                .exerciseTypeName(exercise.getExerciseType().getName())
                .parameters(exercise.getParameters())
                .difficulty(exercise.getDifficulty())
                .points(exercise.getPoints())
                .createdById(exercise.getCreatedBy() != null ? exercise.getCreatedBy().getId() : null)
                .createdByName(exercise.getCreatedBy() != null ?
                        exercise.getCreatedBy().getUser().getFirstName() + " " +
                                exercise.getCreatedBy().getUser().getLastName() : null)
                .createdAt(exercise.getCreatedAt())
                .updatedAt(exercise.getUpdatedAt())
                .build();
    }
}
