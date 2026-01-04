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
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.ArrayList;
import java.util.Arrays;
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
    public Page<ExerciseResponse> getAllExercises(Pageable pageable) {
        return exerciseRepository.findAllByOrderByCreatedAtDesc(pageable)
                .map(this::mapToResponse);
    }

    @Override
    public Page<ExerciseResponse> getExercisesByType(UUID exerciseTypeId, Pageable pageable) {
        return exerciseRepository.findByExerciseType_IdOrderByDifficultyAsc(exerciseTypeId, pageable)
                .map(this::mapToResponse);
    }

    @Override
    public Page<ExerciseResponse> getExercisesByTeacher(UUID teacherId, Pageable pageable) {
        return exerciseRepository.findByCreatedBy_IdOrderByCreatedAtDesc(teacherId, pageable)
                .map(this::mapToResponse);
    }

    @Override
    public Page<ExerciseResponse> getExercisesByDifficulty(Integer difficulty, Pageable pageable) {
        return exerciseRepository.findByDifficultyOrderByCreatedAtDesc(difficulty, pageable)
                .map(this::mapToResponse);
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
        
        String theme = null;
        try {
            JsonNode params = objectMapper.readTree(exercise.getParameters());
            if (params.has("theme")) {
                theme = params.get("theme").asText();
            }
        } catch (Exception e) {
            logger.warn("Failed to parse theme from exercise parameters: {}", e.getMessage());
        }
        
        List<Integer> numbers = generateNumbers(cardCount, digitLength, min, max, theme, exerciseTypeName);
        
        // Calculate expected answer based on exercise type
        Double expectedAnswer = calculateExpectedAnswer(numbers, exerciseTypeName);
        
        logger.info("Generated {} numbers for exercise type: {}, theme: {}, expected answer: {}", 
                numbers.size(), exerciseTypeName, theme != null ? theme : "none", expectedAnswer);
        
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

    private List<Integer> generateNumbers(int count, int digitLength, Integer min, Integer max, String theme, String exerciseTypeName) {
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
        
        boolean isAdditionSubtraction = exerciseTypeName.contains("addition") || 
                                        exerciseTypeName.contains("subtraction") || 
                                        exerciseTypeName.contains("theme");
        
        if (theme != null && !theme.isEmpty() && isAdditionSubtraction) {
            numbers = generateSorobanNumbers(count, digitLength, calculatedMin, calculatedMax, theme);
        } else {
            for (int i = 0; i < count; i++) {
                int number = random.nextInt(calculatedMax - calculatedMin + 1) + calculatedMin;
                numbers.add(number);
            }
        }
        
        return numbers;
    }
    
    private List<Integer> generateSorobanNumbers(int count, int digitLength, int min, int max, String theme) {
        List<Integer> numbers = new ArrayList<>();
        
        if (digitLength == 1 && min >= 1 && max <= 9) {
            List<Integer> candidateNumbers = getSorobanCandidates(theme, min, max);
            
            if (candidateNumbers.isEmpty()) {
                for (int i = 0; i < count; i++) {
                    numbers.add(random.nextInt(max - min + 1) + min);
                }
            } else {
                // Generate from candidates
                for (int i = 0; i < count; i++) {
                    int index = random.nextInt(candidateNumbers.size());
                    numbers.add(candidateNumbers.get(index));
                }
            }
        } else {
            // For multi-digit numbers, extract last digit and apply methodology
            List<Integer> lastDigitCandidates = getSorobanCandidates(theme, 1, 9);
            
            for (int i = 0; i < count; i++) {
                int number;
                if (digitLength == 1) {
                    if (lastDigitCandidates.isEmpty()) {
                        number = random.nextInt(max - min + 1) + min;
                    } else {
                        int candidate = lastDigitCandidates.get(random.nextInt(lastDigitCandidates.size()));
                        if (candidate >= min && candidate <= max) {
                            number = candidate;
                        } else {
                            // Find closest candidate in range or use random
                            number = random.nextInt(max - min + 1) + min;
                        }
                    }
                } else {
                    // Multi-digit: generate base number and adjust last digit based on theme
                    int baseMin = (int) Math.pow(10, digitLength - 1);
                    int baseMax = (int) Math.pow(10, digitLength) - 10;
                    int baseNumber = baseMin + random.nextInt(baseMax - baseMin + 1);
                    
                    // Adjust last digit based on theme
                    int lastDigit = random.nextInt(10);
                    if (!lastDigitCandidates.isEmpty()) {
                        lastDigit = lastDigitCandidates.get(random.nextInt(lastDigitCandidates.size()));
                    }
                    
                    number = baseNumber + lastDigit;
                    
                    // Ensure within bounds
                    if (number < min) number = min;
                    if (number > max) number = max;
                }
                
                numbers.add(number);
            }
        }
        
        return numbers;
    }
    
    private List<Integer> getSorobanCandidates(String theme, int min, int max) {
        List<Integer> candidates = new ArrayList<>();
        theme = theme != null ? theme.toLowerCase().trim() : "";
        
        // Brother method (Ako-dashi): Direct bead manipulation
        // Numbers: 1, 2, 3, 4 (direct up), 6, 7, 8, 9 (direct down with 5-bead)
        List<Integer> brotherNumbers = Arrays.asList(1, 2, 3, 4, 6, 7, 8, 9);
        
        // Friend method (Tomo-dashi): Complementary numbers
        // Numbers: 5 (uses friend: 10-5), also numbers that commonly use friend method
        List<Integer> friendNumbers = Arrays.asList(5, 6, 7, 8, 9);
        
        // All single digits
        List<Integer> allNumbers = Arrays.asList(1, 2, 3, 4, 5, 6, 7, 8, 9);
        
        if (theme.equals("brother")) {
            candidates = new ArrayList<>(brotherNumbers);
        } else if (theme.equals("friend")) {
            candidates = new ArrayList<>(friendNumbers);
        } else if (theme.equals("friend+brother") || theme.equals("friend+brat")) {
            // Combination: prefer numbers that can use either method
            candidates = new ArrayList<>(allNumbers);
        } else if (theme.equals("transition")) {
            // Transition: mix of both, but prefer numbers that can use either
            candidates = new ArrayList<>(allNumbers);
            // Add some preference by including all numbers (50% brother, 50% friend overlap)
        } else if (theme.equals("simple")) {
            // Simple: all numbers (no constraints)
            candidates = new ArrayList<>(allNumbers);
        } else {
            // Unknown theme: use all numbers
            candidates = new ArrayList<>(allNumbers);
        }
        
        // Filter candidates to be within the specified range
        candidates.removeIf(n -> n < min || n > max);
        
        return candidates;
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
